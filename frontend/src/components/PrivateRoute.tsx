import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PrivateRoute: React.FC = () => {
  const { user, isLoading } = useSelector((state: any) => state.auth)

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[70vh]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='spinner'></div>
          <p className='text-sm text-slate-400 font-500'>Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to='/login' />
}

export default PrivateRoute
