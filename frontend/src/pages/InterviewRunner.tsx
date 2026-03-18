import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { getSessionById, submitAnswer, endSession } from '../features/sessions/sessionSlice'
import MonacoEditor from '@monaco-editor/react'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

const SUPPORTED_LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' }, { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' }, { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' }, { label: 'C#', value: 'csharp' },
  { label: 'Go', value: 'go' }, { label: 'Swift', value: 'swift' },
  { label: 'Kotlin', value: 'kotlin' }, { label: 'R Language', value: 'r' },
  { label: 'SQL', value: 'sql' }, { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' }, { label: 'Solidity', value: 'solidity' },
  { label: 'Shell', value: 'shell' }, { label: 'YAML', value: 'yaml' },
  { label: 'Markdown', value: 'markdown' }, { label: 'Plain Text', value: 'plaintext' },
]

const ROLE_LANGUAGE_MAP: Record<string, string> = {
  "MERN Stack Developer": "javascript", "MEAN Stack Developer": "typescript",
  "Full Stack Python": "python", "Full Stack Java": "java",
  "Frontend Developer": "javascript", "Backend Developer": "javascript",
  "Data Scientist": "python", "Data Analyst": "python",
  "Machine Learning Engineer": "python", "DevOps Engineer": "shell",
  "Cloud Engineer (AWS/Azure/GCP)": "yaml", "Cybersecurity Engineer": "python",
  "Blockchain Developer": "solidity", "Mobile Developer (iOS/Android)": "swift",
  "Game Developer": "csharp", "QA Automation Engineer": "python",
  "UI/UX Designer": "css", "Product Manager": "markdown"
}

function InterviewRunner() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { activeSession, isLoading, message } = useSelector((state: any) => state.sessions)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [submittedLocal, setSubmittedLocal] = useState<Record<number, boolean>>({})
  const [drafts, setDrafts] = useState<Record<number, any>>(() => {
    const saved = localStorage.getItem(`drafts_${sessionId}`)
    return saved ? JSON.parse(saved) : {}
  })
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (activeSession?.role) {
      setSelectedLanguage(ROLE_LANGUAGE_MAP[activeSession.role] || 'plaintext')
    }
  }, [activeSession?.role])

  useEffect(() => {
    localStorage.setItem(`drafts_${sessionId}`, JSON.stringify(drafts))
  }, [drafts, sessionId])

  useEffect(() => { dispatch(getSessionById(sessionId) as any) }, [dispatch, sessionId])

  const currentQuestion = activeSession?.questions?.[currentQuestionIndex]
  const isReduxSubmitted = currentQuestion?.isSubmitted === true
  const isLocallySubmitted = submittedLocal[currentQuestionIndex] === true
  const isQuestionLocked = isReduxSubmitted || isLocallySubmitted
  const isProcessing = isQuestionLocked && !currentQuestion?.isEvaluated

  const handleNavigation = (index: number) => {
    if (index >= 0 && index < activeSession?.questions.length) {
      if (isRecording) stopRecording()
      setCurrentQuestionIndex(index)
      setRecordingTime(0)
    }
  }

  const updateDraftCode = (newCode: string | undefined) => {
    if (isQuestionLocked) return
    setDrafts(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], code: newCode } }))
  }

  const startRecording = async () => {
    if (isQuestionLocked) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setDrafts(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], audioBlob: blob } }))
      }
      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
      setRecordingTime(0)
      timerIntervalRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000)
    } catch {
      toast.error('Microphone denied.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      setIsRecording(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (isQuestionLocked) return
    if (isRecording) stopRecording()
    const draft = drafts[currentQuestionIndex]
    const code = draft?.code || ''
    const audio = draft?.audioBlob
    if (!code && !audio) { toast.warning('Please provide code or an audio answer.'); return }
    setSubmittedLocal(prev => ({ ...prev, [currentQuestionIndex]: true }))
    const formData = new FormData()
    formData.append('questionIndex', String(currentQuestionIndex))
    if (code) formData.append('code', code)
    if (audio) formData.append('audioFile', audio, 'answer.webm')
    dispatch(submitAnswer({ sessionId, formData }) as any)
      .unwrap()
      .catch(() => {
        setSubmittedLocal(prev => ({ ...prev, [currentQuestionIndex]: false }))
        toast.error('Submission failed. Please try again.')
      })
  }

  const handleFinishInterview = () => {
    if (!window.confirm('Are you sure you want to finish?')) return
    dispatch(endSession(sessionId) as any)
      .unwrap()
      .then(() => {
        localStorage.removeItem(`drafts_${sessionId}`)
        navigate(`/review/${sessionId}`)
      })
      .catch(() => toast.error('Could not finish session. AI is working on it.'))
  }

  if (!activeSession) {
    return (
      <div className='flex justify-center items-center min-h-[70vh]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='spinner'></div>
          <p className='text-sm text-slate-400'>Loading session...</p>
        </div>
      </div>
    )
  }

  const currentDraft = drafts[currentQuestionIndex] || {}
  const totalQ = activeSession.questions.length

  return (
    <div className='max-w-6xl mx-auto pt-6 pb-32 space-y-5'>
      {/* Session Header */}
      <div className='card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-4 flex-1'>
          <div>
            <h1 className='text-base font-700 text-navy'>{activeSession.role}</h1>
            <p className='text-xs text-slate-400 mt-0.5'>{activeSession.level} · {totalQ} Questions</p>
          </div>

          {/* Progress dots */}
          <div className='flex items-center gap-1.5 ml-2'>
            {activeSession.questions.map((q: any, i: number) => {
              let bg = 'bg-slate-200'
              if (i === currentQuestionIndex) bg = 'bg-purple scale-125 ring-2 ring-purple/20'
              else if (q.isEvaluated) bg = 'bg-emerald-400'
              else if (q.isSubmitted || submittedLocal[i]) bg = 'bg-amber-300 animate-pulse'
              return (
                <button
                  key={i}
                  onClick={() => handleNavigation(i)}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${bg}`}
                  title={`Question ${i + 1}`}
                />
              )
            })}
          </div>
        </div>

        <button
          onClick={handleFinishInterview}
          disabled={isLoading}
          className='px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-600 rounded-xl border border-rose-100 hover:border-rose-200 transition-all disabled:opacity-50 shrink-0'
        >
          {isLoading ? 'Finalizing...' : 'Finish Interview'}
        </button>
      </div>

      {/* Question */}
      <div className='card navy-mesh p-6 sm:p-8'>
        <div className='flex items-center gap-2 mb-3'>
          <span className='badge bg-purple/20 text-purple-light border border-purple/20 text-[11px]'>
            Question {currentQuestionIndex + 1} of {totalQ}
          </span>
          {isProcessing && (
            <span className='badge bg-amber-100 text-amber-600 border border-amber-200 gap-1.5 text-[11px]'>
              <span className='w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse'></span>
              Analyzing...
            </span>
          )}
          {currentQuestion?.isEvaluated && (
            <span className='badge bg-emerald-100 text-emerald-600 border border-emerald-200 gap-1.5 text-[11px]'>
              <span className='w-1.5 h-1.5 rounded-full bg-emerald-400'></span>
              Evaluated
            </span>
          )}
        </div>
        <h2 className='text-lg sm:text-xl font-500 text-white leading-relaxed'>{currentQuestion?.questionText}</h2>
      </div>

      {/* Answer Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        {/* Voice */}
        <div className='card p-6 flex flex-col items-center justify-center min-h-[280px]'>
          <p className='field-label mb-6'>Verbal Answer</p>
          {!isRecording && !currentDraft.audioBlob ? (
            <button
              onClick={startRecording}
              disabled={isQuestionLocked}
              className='w-20 h-20 bg-navy rounded-2xl flex items-center justify-center text-2xl shadow-lg hover:scale-105 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
            >
              🎤
            </button>
          ) : isRecording ? (
            <div className='flex flex-col items-center gap-4'>
              <button
                onClick={stopRecording}
                className='w-20 h-20 bg-rose-500 rounded-2xl flex items-center justify-center text-2xl animate-pulse shadow-lg hover:scale-105 transition-all'
              >
                ⏹
              </button>
              <span className='font-mono text-rose-500 font-600 text-sm'>{recordingTime}s</span>
            </div>
          ) : (
            <div className='text-center'>
              <div className='w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 text-2xl mb-3 mx-auto border border-emerald-100'>✓</div>
              <p className='font-600 text-emerald-600 text-sm'>Audio captured</p>
              {!isQuestionLocked && (
                <button
                  onClick={() => setDrafts(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], audioBlob: null } }))}
                  className='text-xs text-slate-400 hover:text-rose-500 mt-2 underline transition-colors'
                >
                  Re-record
                </button>
              )}
            </div>
          )}
          <p className='text-xs text-slate-400 mt-4'>
            {isQuestionLocked ? 'Response locked' : isRecording ? 'Recording... click to stop' : 'Click to record your answer'}
          </p>
        </div>

        {/* Code Editor */}
        <div className='card overflow-hidden' style={{ height: '320px' }}>
          <div className='flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100'>
            <span className='text-xs font-700 text-slate-400 uppercase tracking-wider'>Code Editor</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isQuestionLocked}
              className='text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-500 text-slate-600 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer'
            >
              {SUPPORTED_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div style={{ height: 'calc(100% - 44px)' }}>
            <MonacoEditor
              height='100%'
              language={selectedLanguage}
              theme='vs-dark'
              value={currentDraft.code || ''}
              onChange={updateDraftCode}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                readOnly: isQuestionLocked,
                domReadOnly: isQuestionLocked,
                lineNumbers: 'on',
                padding: { top: 12 },
              }}
            />
          </div>
        </div>
      </div>

      {/* AI Feedback */}
      <AnimatePresence>
        {currentQuestion?.isEvaluated && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className='card p-6 border-l-4 border-emerald-400 bg-emerald-50/50'
          >
            <div className='flex items-center gap-2 mb-3'>
              <span className='text-lg'>💡</span>
              <h3 className='font-700 text-emerald-800 text-sm'>AI Feedback</h3>
              <span className='ml-auto badge bg-emerald-100 text-emerald-700 border border-emerald-200'>
                Score: {currentQuestion.technicalScore}/100
              </span>
            </div>
            <p className='text-emerald-700 text-sm leading-relaxed'>{currentQuestion.aiFeedback}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <div className='fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-lg z-50'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3'>
          <button
            onClick={() => handleNavigation(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
            className='flex items-center gap-1.5 text-sm font-500 text-slate-400 hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
            </svg>
            Previous
          </button>

          <div className='flex flex-col items-center gap-1.5'>
            {isProcessing && message && (
              <p className='text-[11px] font-600 text-purple bg-purple-pale px-3 py-1 rounded-full animate-pulse'>
                🤖 {message}...
              </p>
            )}
            <button
              onClick={handleSubmitAnswer}
              disabled={isQuestionLocked}
              className={`px-8 py-2.5 rounded-xl font-600 text-sm transition-all shadow-sm ${
                isProcessing ? 'bg-slate-100 text-slate-400 cursor-wait' :
                currentQuestion?.isEvaluated ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                isQuestionLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                'bg-navy text-white hover:bg-navy-700 hover:shadow-md active:scale-[0.98]'
              }`}
            >
              {isProcessing ? 'Analyzing...' :
               currentQuestion?.isEvaluated ? '✓ Submitted' :
               isQuestionLocked ? 'Submitted' : 'Submit Answer'}
            </button>
          </div>

          <button
            onClick={() => handleNavigation(currentQuestionIndex + 1)}
            disabled={currentQuestionIndex === activeSession.questions.length - 1}
            className='flex items-center gap-1.5 text-sm font-500 text-slate-400 hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
          >
            Next
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default InterviewRunner
