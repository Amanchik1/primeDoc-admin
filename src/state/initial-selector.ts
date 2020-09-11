import {GlobalStateType} from './root-reducer'


export const getHeader = (state: GlobalStateType) => state.app.header

export const isPending = (state: GlobalStateType) => state.app.initialise

// export const getUsersList = (state: GlobalStateType) => state.app.users

export const getIllnesses = (state: GlobalStateType) => state.app.illnesses


export const getCategories = (state: GlobalStateType) => state.app.directions


