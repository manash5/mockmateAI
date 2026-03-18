import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { getSessionById } from '../features/sessions/sessionSlice'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { motion } from 'framer-motion'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const formatDuration = (start: string, end: string): string => {
  if (!start || !end) return 'N/A'
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

const sanitizeQuestionText = (text: string): string =>
  text.replace(/^\d+[\s\.)\-]+/, '').trim()

const formatIdealAnswer = (text: string): string => {
  try {
    if (!text) return 'Pending evaluation.'
    let cleanText = text.trim()
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '').trim()
    }
    if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
      const parsed = JSON.parse(cleanText)
      if (parsed.verbalAnswer || parsed.idealAnswer || parsed.idealanswer) {
        return parsed.verbalAnswer || parsed.idealAnswer || parsed.idealanswer
      }
      const explanation = parsed.explanation || parsed.understanding || ''
      const code = parsed.code || parsed.codeExample || parsed.example || ''
      if (explanation || code) return `${explanation}\n\n${code}`.trim()
    }
    return text
  } catch { return text }
}

const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 80 }) => {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (score / 100) * circumference
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e'

  return (
    <svg width={size} height={size} className='rotate-[-90deg]'>
      <circle cx={size/2} cy={size/2} r={radius} fill='none' stroke='#f1f5f9' strokeWidth='6' />
      <circle
        cx={size/2} cy={size/2} r={radius} fill='none'
        stroke={color} strokeWidth='6'
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap='round'
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text
        x={size/2} y={size/2} textAnchor='middle' dy='0.35em'
        fill={color} fontSize='15' fontWeight='700' fontFamily='DM Sans'
        style={{ transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}
      >
        {score}
      </text>
    </svg>
  )
}

function SessionReview() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const dispatch = useDispatch()
  const { activeSession, isLoading } = useSelector((state: any) => state.sessions)

  useEffect(() => { dispatch(getSessionById(sessionId ) as any) }, [dispatch, sessionId] )

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[70vh]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='spinner'></div>
          <p className='text-sm text-slate-400 animate-pulse'>Generating your analysis...</p>
        </div>
      </div>
    )
  }

  if (!activeSession || activeSession.status !== 'completed') {
    return (
      <div className='flex justify-center items-center min-h-[70vh]'>
        <div className='card p-8 sm:p-12 text-center max-w-md'>
          <div className='text-4xl mb-4'>⏳</div>
          <h2 className='text-xl font-700 text-navy mb-2'>Report not ready yet</h2>
          <p className='text-slate-400 text-sm mb-6'>This session is still being processed by our AI network.</p>
          <Link to='/' className='inline-flex items-center gap-2 px-6 py-3 bg-navy text-white font-600 text-sm rounded-xl hover:bg-navy-700 transition-all'>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { overallScore, metrics, role, level, questions, startTime, endTime } = activeSession
  const finalMetrics = metrics || {}

  const scoreColor = overallScore >= 75 ? 'text-emerald-600' : overallScore >= 50 ? 'text-amber-500' : 'text-rose-500'

  const barData = {
    labels: questions.map((_: any, i: number) => `Q${i + 1}`),
    datasets: [{
      label: 'Technical Score',
      data: questions.map((q: any) => q.technicalScore || 0),
      backgroundColor: questions.map((q: any) => (q.technicalScore || 0) >= 70 ? '#10b981' : (q.technicalScore || 0) >= 40 ? '#f59e0b' : '#f43f5e'),
      borderRadius: 6,
      borderSkipped: false,
    }]
  }

  const statCards = [
    { label: 'Overall Score', value: `${overallScore}%`, highlight: true },
    { label: 'Avg Technical', value: `${finalMetrics.avgTechnical || 0}%` },
    { label: 'Avg Confidence', value: `${finalMetrics.avgConfidence || 0}%` },
    { label: 'Duration', value: formatDuration(startTime, endTime) },
  ]

  return (
    <div className='max-w-6xl mx-auto pt-8 pb-20 space-y-8 animate-fade-in'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-6 border-b border-slate-100'
      >
        <div>
          <span className='text-xs font-700 uppercase tracking-widest text-purple'>Assessment Complete</span>
          <h1 className='text-3xl sm:text-4xl font-700 text-navy mt-1 tracking-tight'>
            {role}
            <span className='text-slate-300 font-400 text-xl ml-2'>({level})</span>
          </h1>
        </div>
        <div className='flex items-center gap-3'>
          <div className='text-right mr-1'>
            <p className='text-xs text-slate-400 font-500'>Overall Result</p>
            <p className={`text-4xl font-700 leading-none ${scoreColor}`}>{overallScore}%</p>
          </div>
          <ScoreRing score={overallScore} />
        </div>
      </motion.div>

      {/* Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`card p-5 sm:p-6 ${stat.highlight ? 'border-purple/20 bg-purple-pale/30' : ''}`}
          >
            <p className='text-[10px] font-700 text-slate-400 uppercase tracking-widest'>{stat.label}</p>
            <p className={`text-2xl sm:text-3xl font-700 mt-1.5 leading-none ${stat.highlight ? 'text-purple' : 'text-navy'}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='card p-6 sm:p-8'
      >
        <h3 className='field-label mb-6'>Per-Question Performance</h3>
        <div className='h-56 sm:h-72'>
          <Bar
            data={barData}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true, max: 100,
                  grid: { color: '#f1f5f9' },
                  ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 } }
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 } }
                }
              }
            }}
          />
        </div>
      </motion.div>

      {/* Question Review */}
      <div className='space-y-4'>
        <h3 className='text-xl font-700 text-navy flex items-center gap-3'>
          <span className='w-9 h-9 rounded-2xl bg-navy flex items-center justify-center text-white text-sm'>✓</span>
          Answer Intelligence
        </h3>

        <div className='space-y-4'>
          {questions.map((q: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className='card overflow-hidden hover:shadow-medium transition-shadow duration-300'
            >
              <div className='p-6 sm:p-8 space-y-6'>
                {/* Question header */}
                <div className='flex flex-col lg:flex-row justify-between items-start gap-4'>
                  <h4 className='text-base sm:text-lg font-600 text-navy flex-1 leading-snug'>
                    <span className='text-purple font-700 mr-1.5'>Q{index + 1}.</span>
                    {sanitizeQuestionText(q.questionText)}
                  </h4>
                  <div className='flex gap-2 shrink-0'>
                    <ScoreBadge label='Tech' score={q.technicalScore} color='emerald' />
                    <ScoreBadge label='Conf' score={q.confidenceScore} color='blue' />
                  </div>
                </div>

                {/* Submission */}
                <div>
                  <p className='field-label mb-2'>Your Submission</p>
                  <div className='bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden'>
                    {q.userSubmittedCode && q.userSubmittedCode !== 'undefined' && (
                      <div className='p-4 sm:p-5 border-b border-slate-100'>
                        <p className='text-[10px] font-700 text-slate-300 uppercase tracking-wider mb-2'>Code</p>
                        <pre className='text-xs font-mono text-slate-600 whitespace-pre-wrap overflow-x-auto leading-relaxed'>
                          {q.userSubmittedCode}
                        </pre>
                      </div>
                    )}
                    {q.userAnswerText && (
                      <div className='p-4 sm:p-5'>
                        <p className='text-[10px] font-700 text-slate-300 uppercase tracking-wider mb-2'>Transcript</p>
                        <p className='text-sm text-slate-600 italic leading-relaxed'>"{q.userAnswerText}"</p>
                      </div>
                    )}
                    {(!q.userSubmittedCode || q.userSubmittedCode === 'undefined') && !q.userAnswerText && (
                      <div className='py-6 text-center text-slate-400 text-xs italic'>No answer recorded.</div>
                    )}
                  </div>
                </div>

                {/* Feedback & Ideal */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4 border-t border-slate-50'>
                  <div>
                    <p className='field-label mb-2'>AI Analytical Feedback</p>
                    <div className='bg-slate-50 p-4 rounded-2xl text-sm italic text-slate-600 border-l-4 border-purple leading-relaxed'>
                      "{q.aiFeedback}"
                    </div>
                  </div>
                  <div>
                    <p className='field-label mb-2'>Ideal Implementation</p>
                    <pre className='bg-navy text-slate-300 p-4 rounded-2xl text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed'>
                      {formatIdealAnswer(q.idealAnswer)}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

const ScoreBadge: React.FC<{ label: string; score: number; color: 'emerald' | 'blue' }> = ({ label, score, color }) => {
  const styles = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
  }[color]

  return (
    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${styles}`}>
      <span className='text-[9px] font-700 uppercase text-slate-400'>{label}</span>
      <span className='text-xs font-700'>{score}%</span>
    </div>
  )
}

export default SessionReview
