import React, {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from "react-redux";
import {editDirection, setHeader} from "../../state/appReducer";
import {
    BtnFloat,
    GreenBtn,
    GreenDiv,
    HeaderWrapper,
    Input,
    InputNone
} from "../mainStyledComponents/MainStyledComponents";
import css from './clinicdirection.module.css'
import addPicture from '../../img/add-pic.png'
import Preloader from "../preloader/Preloader";
import {Link, useParams} from "react-router-dom";
import api from '../../api/Api'
import DeleteModal from "../utils/DeleteModal";
import ModalWrapper from "../modal/Modal";
// import EditDeleteComponent from "../utils/EditDelete";
import {GlobalStateType} from "../../state/root-reducer";
import {getIllnesses} from '../../state/initial-selector'
import Select from "react-select";
import {selectStyles} from "../utils/customSelect";
import {checkToken} from "../../state/authReducer";

const ClinicDirection = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(setHeader(data.name))
    }, [dispatch])

    const requestCheck =  async (req:any) => {
        return dispatch(checkToken(req))
    }

    const edit = useSelector((state: GlobalStateType) => state.app.directionEdit)
    const params: { id: string } = useParams()


    const illnessesArr = useSelector((state: GlobalStateType) => getIllnesses(state))

    const [pending, setPending] = useState(true)
    const [data, setData] = useState<any>({})
    const [doctors, setDoctors] = useState([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState('')
    const [img, setImg] = useState('')
    const [illness, setIllness] = useState<any>('')
    const [options, setOptions] = useState<any>([])
    console.log(image)
    const nameChange = (e: any) => setName(e.target.value)
    const descriptionChange = (e: any) => setDescription(e.target.value)
    const illnessesChange = (e: any) => setIllness(e.target.value)

    const changeCategory = () => {
        let data = {
            description: description,
            name: name,
            // image: image,
            illness: illness
        }
        const newData = new FormData()
        if(img) newData.append('imageFile', img)

        console.log(data)
        requestCheck(()=>api.putCategory(params.id, data))
            .then((res:any) => {
                console.log(res.data)
            })
        if(img) {
            requestCheck(() => api.putCategoryImage(params.id, newData))
                .then((res: any) => {
                    console.log(res.data)
                })
        }
    }
    const setEdit = useCallback(() => {
        dispatch(editDirection(false))
    }, [])
    useEffect(() => {
        requestCheck(()=>api.getCategory(params.id))
            .then((res: any) => {
                console.log(res)
                dispatch(setHeader(res.data.name))
                setData(res.data)
                setImage(res.data.image)
                setDoctors(res.data.doctors)
                setName(res.data.name)
                setDescription(res.data.description)
                setIllness(res.data.illness)
                setPending(false)
            })
        return setEdit
    }, [])
    if (pending) {
        return (
            <Preloader/>
        )
    }
    return (
        <div>
            <BtnFloat>
                {
                    !edit
                        ? <GreenBtn onClick={() => dispatch(editDirection(!edit))}>Изменить</GreenBtn>
                        : <GreenBtn onClick={() => {
                            changeCategory()
                            dispatch(editDirection(!edit))
                        }}>Сохранить</GreenBtn>
                }
            </BtnFloat>
            <HeaderWrapper>
                <div className={css.picWrapper}>
                    <span>
                    <img
                        width={'100%'}
                        src={image ? image : "https://image.freepik.com/free-photo/front-view-doctor-with-medical-mask-posing-with-crossed-arms_23-2148445082.jpg"}
                        alt="#"
                    />
                    </span>
                    {
                        !edit
                            ? null
                            : <label>
                                <InputNone onChange={(e: any) => {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(e.target.files[0]);
                                    reader.onload = (e: any) => {
                                        const newData = e.target.result.split(',')
                                        setImage(e.target.result)
                                    }
                                    setImg(e.target.files[0])
                                }} type={'file'}/>
                                <GreenDiv>Добавить фото</GreenDiv>
                            </label>
                    }
                </div>
                <div className={css.descriptionWrapper}>
                    <DescriptionElement setText={nameChange} editing={edit} title={'Название'} text={name}/>
                    <DescriptionElement setText={descriptionChange} editing={edit} title={'Описание'}
                                        text={description}/>
                    <DescriptionElement setText={illnessesChange} editing={edit} title={'Что лечит'}
                                        text={illness}/>
                    {/*<DescriptionIllnessElement options={options} setText={illnessesChange} editing={edit}*/}
                    {/*                           title={'Что лечит'}*/}
                    {/*                           illnesses={illness}/>*/}
                </div>
            </HeaderWrapper>
            <div className={css.doctorsList}>
                {
                    doctors
                        ? doctors.map((item: any) => <Doctors id={item.id} key={item.id} name={item.firstName + ' ' + item.lastName}
                                                        url={item.image}/>)
                        : null
                }
            </div>
            {/*<div className={css.addDoc}>*/}
            {/*    <Link to={'/personal/add'}>*/}
            {/*        <GreenBtn>Добавить врача</GreenBtn>*/}
            {/*    </Link>*/}
            {/*</div>*/}
        </div>
    )
}

type descriptionType = {
    title: string,
    text: string,
    setText: (e: any) => void,
    editing?: boolean
}
const DescriptionElement = (props: descriptionType) => {
    return (
        <div>
            <div className={css.title}>{props.title}</div>
            <div className={css.description}>
                {
                    props.editing ? <Input type="text" value={props.text} onChange={props.setText}/> :
                        <p>{props.text}</p>
                }
                {/*<EditDeleteComponent editing={editing} onEdit={onEdit} onModal={onModal} onDone={setDoctor}/>*/}
            </div>
        </div>
    )
}

///////////////////////////////////////////////////////////////////////////////////////////
type descriptionIllnessType = {
    title: string,
    illnesses: any,
    setText: (e: any) => void,
    editing?: boolean
    options: any
}
const DescriptionIllnessElement = (props: descriptionIllnessType) => {
    console.log(props.illnesses)
    return (
        <div>
            <div className={css.title}>{props.title}</div>
            <div className={css.description}>
                {
                    props.editing
                        ? <Select isMulti={true} styles={selectStyles} options={props.options}
                                  value={props.illnesses}
                                  placeholder={''}
                                  onChange={(e: any) => e ? props.setText([...e]) : props.setText([])}
                        />
                        : <p>{props.illnesses.map((item: any, index: number) => <React.Fragment key={item.label}>
                            {item.label}{index === props.illnesses.length - 1 ? null : ', '}
                        </React.Fragment>)}
                        </p>
                }
            </div>
        </div>
    )
}


type DocType = {
    id: number
    name: string
    url?: string
}
const Doctors = (props: DocType) => {
    const dispatch = useDispatch()
    const requestCheck =  async (req:any) => {
        return dispatch(checkToken(req))
    }
    const deleteDoctor = () => {
        requestCheck(()=>api.delDoctor(props.id))
            .then((res: any) => {
                console.log(res)
            })
    }
    const [name, setName] = useState(props.name)
    const [editing, setEditing] = useState(false)
    const onEdit = () => setEditing(!editing)
    const [visible, setVisible] = useState(false)
    const onModal = () => setVisible(!visible)
    const setDoctor = () => {
        onEdit()
        // alert(name)
    }
    return (
        <>
            <div className={css.doctorWrapper}>
                <Link to={`/personal/${props.id}`} className={css.ava}>
                    <div className={css.logoWrapper}>
                        {
                            props.url
                                ? <img height={'auto'} width={'100%'}
                                       src={props?.url ? props.url : 'https://icon-library.com/images/no-profile-pic-icon/no-profile-pic-icon-27.jpg'}
                                       alt="doc"/>
                                : <img height={'auto'} width={'100%'}
                                       src="https://jardin.ee/wp-content/uploads/2014/08/No-profile-LinkedIn.jpg"
                                       alt="#"/>
                        }
                        <img src={addPicture} alt="+" className={css.addPicture} onClick={() => {}}/>
                    </div>
                    <div className={css.name}>
                        {editing ? <input type="text" value={name} onChange={(e) => setName(e.target.value)}/> : name}
                    </div>
                </Link>
                <div>
                    {/*<EditDeleteComponent noEdit={true}  editing={editing} onEdit={onEdit} onModal={onModal} onDone={setDoctor}/>*/}
                </div>
            </div>
            <ModalWrapper onModal={onModal} visible={visible} width={"450"} height={"400"} onClickAway={onModal}>
                <DeleteModal text={'Вы уверены что хотите удалить'} onModal={onModal} title={props.name}
                             del={deleteDoctor}/>
            </ModalWrapper>
        </>
    )
}

export default ClinicDirection