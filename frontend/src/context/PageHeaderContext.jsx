import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react'

const SetterCtx = createContext(null)
const GetterCtx = createContext(null)

export function PageHeaderProvider({ children }) {
  const [title, setTitleState] = useState('')
  const [actions, setActionsState] = useState(null)

  const setTitle = useCallback((title) => setTitleState(title), [])
  const setActions = useCallback((actions) => setActionsState(actions ?? null), [])

  const setter = useMemo(() => ({ setTitle, setActions }), [setTitle, setActions])

  return (
    <SetterCtx.Provider value={setter}>
      <GetterCtx.Provider value={{ title, actions }}>
        {children}
      </GetterCtx.Provider>
    </SetterCtx.Provider>
  )
}

export function usePageHeader(title, actions) {
  const { setTitle, setActions } = useContext(SetterCtx)

  // Sincroniza en cada render (antes de pintar)
  useLayoutEffect(() => {
    setTitle(title)
    setActions(actions ?? null)
  })

  // Limpia al desmontar
  useLayoutEffect(() => {
    return () => {
      setTitle('')
      setActions(null)
    }
  }, [setTitle, setActions])
}

export function usePageHeaderGetter() {
  return useContext(GetterCtx)
}
