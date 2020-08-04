import React, {useEffect, useState} from 'react'
import css from './about-us.module.css'
import {useDispatch} from "react-redux";
import {setHeader} from "../../state/appReducer";
import edit from "../../img/edit.png";
import del from "../../img/delete.png";
import {EditDelete, GreenBtn, GreenDiv, Input, TextArea} from "../mainStyledComponents/MainStyledComponents";
import api from '../../api/Api'
import EditDeleteComponent from "../utils/EditDelete";
import {useFormik} from "formik";
import ModalWrapper from "../modal/Modal";
import Preloader from "../preloader/Preloader";




const AboutUs = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(setHeader("О нас"))
    }, [dispatch])
    const [data, setData] = useState<any>([])
    const [files, setFiles] = useState<any>([])
    const [file, setFile] = useState<any>(null)
    const [pending, setPending] = useState(true)

    useEffect(()=>{
        api.getAboutUs()
            .then((res)=>{
                setData(res.data)
            })
        api.getDocs()
            .then((res)=>{
                setFiles(res.data)
                setPending(false)
            })
    },[pending])
    const saveFile = () => {
        setPending(true)
        const f = new FormData()
        f.append('file',file)
        api.docsUpload(f)
            .then((res)=>{
                console.log(res)
                setFile(null)
            })
    }



    if(pending) {
        return <Preloader />
    }
    return (
        <div>
            <div className={css.infoWrapper}>
                {
                    data.map((item:any) => <Part
                        key={item.id}
                        id={item.id}
                        order={item.order}
                        header={item.header}
                        paragraph={item.paragraph} />)
                }
                {/*<div className={css.contact}>Контакты</div>*/}
                {/*<div>*/}
                {/*    <div className={css.header}>Адрес в Бишкеке:</div>*/}
                {/*    <span>г.Бишкек ул.Сыдыкова 113, пер. ул.Тоголок-Молдо</span>*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*    <div className={css.header}>Контактные данные:</div>*/}
                {/*    <div>*/}
                {/*    <span>+996 501 116 622</span><br/>*/}
                {/*    <span>+996 551 152 200</span>*/}
                {/*    </div>*/}
                {/*    <span className={css.editWrapper}>*/}
                {/*        <EditDelete>*/}
                {/*            <img src={edit} alt="edit"/>*/}
                {/*            <img src={del} alt="delete"/>*/}
                {/*        </EditDelete>*/}
                {/*    </span>*/}
                {/*</div>*/}
                <div className={css.files}>
                    {
                        files.map((item:any)=><File key={item.id} id={item.id} code={item.code} name={item.fileName} />)
                    }
                </div>
                <div className={css.btnWrapper}>
                    {
                        file
                            ? <div>
                                <div className={css.file__name}>
                                    <span>{file.name}</span>
                                    </div>
                                <GreenBtn onClick={saveFile}>Сохранить</GreenBtn>
                            </div>
                            : <label>
                                <input className={css.none} onChange={(e:any) => setFile(e.target.files[0])} type={'file'} />
                                <GreenDiv>Добавить файл</GreenDiv>
                            </label>
                    }
                    {/*<GreenBtn className={css.blue}>Загрузить с...</GreenBtn>*/}
                </div>
            </div>
        </div>
    )
}

type FileProps = {
    name: string
    code: string
    id: number
}
const File = (props:FileProps) => {
    const getFile = () => {
        get_file_url(`http://165.22.74.215:8080/api/v1/docs/download/${props.code}`)
    }
    function get_file_url(url:string) {

        let link_url:any = document.createElement("a");

        link_url.download = url.substring((url.lastIndexOf("/") + 1), url.length);
        link_url.href = url;
        document.body.appendChild(link_url);
        link_url.click();
        document.body.removeChild(link_url);

        link_url = null;
    }
    return (
        <div onClick={getFile} className={css.file}>
            <div className={css.fileWrapper}>
                <img src="https://image.flaticon.com/icons/svg/2921/2921724.svg" alt="file"/>
            </div>
            <span>{props.name}</span>
        </div>
    )
}

type PartProps = {
    paragraph: string
    header: string
    id: number
    order: number
}
const Part = (props:PartProps) => {
    const [edit, setEdit] = useState(false)
    const onEdit = () => setEdit(!edit)
    const formik = useFormik({
        initialValues: {
            paragraph: props.paragraph,
            header: props.header
        },
        // validate,
        onSubmit: (values) => {
            api.setAboutUs(props.id,{
                header: values.header,
                id: props.id,
                order: props.order,
                paragraph: values.paragraph
            }).then((res)=>console.log(res))
            onEdit()
        },
    });
    return (
        <div className={css.partWrapper}>
            <div className={css.contact}>{formik.values.header}</div>
            <p>
                {formik.values.paragraph}
            </p>
            <span className={css.editWrapper}>
                <EditDeleteComponent editing={edit} onEdit={onEdit} onModal={()=>{}} onDone={()=>{}} noDel={true} />
            </span>
            <ModalWrapper onModal={onEdit} visible={edit} width={"450"} height={"400"}
                          onClickAway={onEdit}>
                <form onSubmit={formik.handleSubmit} className={css.editModalWrapper}>
                    <Input name={'header'} onChange={formik.handleChange} type="text" value={formik.values.header}/>
                    <TextArea className={css.textArea} name={'paragraph'} onChange={formik.handleChange}  value={formik.values.paragraph}/>
                    <GreenBtn>Сохранить</GreenBtn>
                </form>
            </ModalWrapper>
        </div>
    )
}

export default AboutUs