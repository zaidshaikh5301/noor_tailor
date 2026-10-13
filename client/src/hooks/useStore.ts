import { useContext } from 'react'
import { StoreContext } from '../context/store'

export function useStore(){
  const value=useContext(StoreContext)
  if(!value)throw new Error('useStore must be used within StoreProvider')
  return value
}
