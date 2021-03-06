import React, {useEffect, useState} from 'react'
import {Title} from "../admin/AdminComponents";
import {
    DownloadPictureWrapper,
    GreenBtn,
    GreenDiv,
    Input,
    InputNone
} from "../mainStyledComponents/MainStyledComponents";
import css from './createPersonal.module.css'
import {useDispatch, useSelector} from "react-redux";
import {setHeader} from "../../state/appReducer";
import pic from "../../img/pic.png";
import {Field, FieldArray, Form, Formik, useField, useFormikContext, FieldProps} from "formik";
import api from '../../api/Api'
import {useHistory} from "react-router-dom";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ru from 'date-fns/locale/ru';
import Select from "react-select";
import {selectStyles} from "../utils/customSelect";
import {GlobalStateType} from "../../state/root-reducer";
import {getCategories} from "../../state/initial-selector";
import * as Yup from "yup";
// import deepEqual from "lodash.isequal";
import {checkToken} from "../../state/authReducer";
import {firestore} from "firebase";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import del from '../../img/delete.png'

registerLocale('ru', ru)

const validateFormik = {
    surname: Yup.string()
        .required('Объязательное поле'),
    name: Yup.string()
        .required('Объязательное поле'),
    password1: Yup.string()
        .min(8, 'Минимум 8 символов')
        .required('Объязательное поле'),
    password2: Yup.string()
        .min(8, 'Минимум 8 символов')
        .oneOf([Yup.ref('password1')], 'Не совпадают')
        .required('Объязательное поле'),
    login: Yup.string()
        .min(4, 'Объязательное поле'),
    // login: Yup.string()
    //     .required('Объязательное поле'),
    degree: Yup.array()
        .of(
            Yup.object().shape({
                start: Yup.date().required('Объязательное поле начало'),
                organizationName: Yup.string().required('Объязательное поле'),
                name: Yup.string().required('Объязательное поле'),
                infoType: Yup.string().required('Объязательное поле'),
            })
        )


}

const CreatePersonal = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(setHeader("Создание врача"))
    }, [dispatch])
    const requestCheck = async (req: any) => {
        return dispatch(checkToken(req))
    }
    const history = useHistory()
    const dataBase = firestore()

    const categories = useSelector((state: GlobalStateType) => getCategories(state))
    const [img, setImg] = useState('')
    const [image, setImage] = useState('')
    const [category, setCategory] = useState<any>([])
    const [options, setOptions] = useState<any>([])
    const [time, setTime] = useState(false)
    const [login, setLogin] = useState('')
    const [errorText, setErrorText] = useState('')
    const degreeOption = [
        {
            value: 'EXPERIENCE',
            label: 'Опыт работы'
        },
        {
            value: 'REGALIA',
            label: 'Образование'
        }
    ]
    let deg = {
        infoType: '',
        name: '',
        organizationName: '',
        start: '',
        end: '',

    }
    const initialValue = {
        surname: '',
        name: '',
        middleName: '',
        aboutDoctor: '',
        regalia: '',
        login: '',
        password1: '',
        password2: '',
        email: '',
        organizationName: '',
        degree: [
            {
                infoType: '',
                name: '',
                organizationName: '',
                start: '',
                end: '',
            }
        ]
    }

    useEffect(() => {
        const data = categories.map((item: any) => ({
            value: item.id,
            label: item.name
        }))
        setOptions(data)
    }, [categories])

    return (<div>
            <Title>Данные врача</Title>
            <Formik
                initialValues={initialValue}
                validationSchema={Yup.object().shape(validateFormik)}
                onSubmit={(values, {setSubmitting}) => {
                    setSubmitting(true);
                    let data: any = {
                        bio: values.aboutDoctor,
                        birthDate: null,
                        categories: category.map((item: any) => item.value),
                        firstName: values.name,
                        information: values.degree,
                        lastName: values.surname,
                        password: values.password1,
                        patronymic: values.middleName,
                        position: null,
                        schedules: null,
                        username: '+' + login
                    }
                    const formData = new FormData()
                    formData.append('doctor', new Blob([JSON.stringify(data)], {type: 'application/json'}))
                    if (image) formData.append('imageFile', image)
                    requestCheck(() => api.setDoctor(formData))
                        .then(async (res: any) => {
                            try {
                                let doc = await dataBase?.collection("doctors").doc(`${res.data.doctor_id}`)
                                doc.set({
                                    id: res.data.doctor_id ? res.data.doctor_id : res.data.id,
                                    name: res.data?.firstName ? res.data?.firstName : ' ',
                                    isOnline: true,
                                    fatherName: res.data.lastName ? res.data.lastName : ' ',
                                    surname: res.data.patronymic ? res.data.patronymic : ' ',
                                    phone: res.data.username ? res.data.username : ' ',
                                    image: res.data.image ? res.data.image : ' '
                                });
                            } catch (error) {
                                // alert('some error with creating doctors')
                                console.log(error.message)
                            }
                            if (time) {
                                history.push(`/personal/0/add/${res.data.id}`)
                            } else {
                                history.push('/personal')
                            }
                        }, (error: any) => {
                            if(error.response.status === 409){
                                setErrorText('Пользователь с данным номером уже существует!')
                            }
                            setSubmitting(false)
                            console.log(error)
                        })
                }}
            >
                {
                    ({
                         values,
                         touched,
                         errors,
                         // initialValues,
                         isSubmitting,
                         handleChange,
                         handleBlur,
                     }) => {
                        // const hasChanged = !deepEqual(values, initialValues);
                        const hasErrors = Object.keys(errors).length > 0;
                        return <Form className={css.formWrapper}>
                            <div className={css.form}>
                                <label className={css.label}>
                                    <span>
                                    <span>*</span>Фамилия
                                        <span className={css.error}>
                                            {touched.surname && errors.surname ? <div>{errors.surname}</div> : null}
                                        </span>
                                    </span>
                                    <Field as={Input} name={"surname"}/>
                                </label>
                                <label className={css.label}>
                                    <span><span>*</span>Имя
                                        <span className={css.error}>
                                            {touched.name && errors.name ? <div>{errors.name}</div> : null}
                                        </span>
                                    </span>
                                    <Field as={Input} name={"name"}/>
                                </label>
                                <label className={css.label}>
                                    <span>Отчество</span>
                                    <Field as={Input} name={"middleName"} type={'text'}/>
                                </label>
                                <label className={css.label}>
                                    <span><span>*</span>О враче</span>
                                    <Field as={Input} name={"aboutDoctor"} type={'text'}/>
                                </label>
                                <label className={css.label}>
                                    <span><span>*</span>Логин
                                        <span className={css.error}>
                                            {touched.login && errors.login ? <div>{errors.login}</div> : null}
                                        </span>
                                    </span>
                                    <PhoneInput onChange={(e) => setLogin(e)} containerClass={css.container}
                                                inputClass={css.inputClass} country={'kg'} value={login}/>
                                    <input type="text" style={{opacity: 0, height: 0, border: 'none'}} disabled value={login} required/>
                                    {/*<Field as={PhoneInput} value={values.login} containerClass={css.container} inputClass={css.inputClass} country={'kg'} name={"login"}/>*/}
                                </label>
                                <label className={css.label}>
                                    <span><span>*</span>Категории
                                    <span className={css.error}>
                                            {/*{formik.errors.categories ? <div>{formik.errors.categories}</div> : null}*/}
                                        </span>
                                    </span>
                                    <Select
                                        noOptionsMessage={() => 'Загрузка...'}
                                        onBlur={handleBlur}
                                        isMulti
                                        styles={selectStyles}
                                        options={options}
                                        onChange={(e) => setCategory(e)}
                                        value={category}
                                        name={"category"}
                                        placeholder={''}
                                    />
                                </label>
                                <FieldArray
                                    name="degree"
                                    render={(arrayHelpers) => {

                                        return (
                                            <div>
                                                {values.degree && values.degree.length > 0 ? (
                                                    values.degree.map((degree, index) => (
                                                        <label key={index} className={css.label}>
                                                            <div className={css.trash}>
                                                            <span className={css.remove} onClick={()=> arrayHelpers.remove(index)}>
                                                                <img src={del} alt="remove"/>
                                                            </span>
                                                            </div>
                                                            <span><span>*</span>Регалии
                                                                <span className={css.error}>
                                                                {
                                                                    // @ts-ignore
                                                                    touched.degree && touched.degree[index] && touched.degree[index].infoType && errors.degree && errors.degree[index] && errors.degree[index].infoType ? <div>{errors?.degree[index].infoType}</div> : null
                                                                }
                                                            </span>
                                                            </span>
                                                            <Field name={`degree.${index}.infoType`} component={SelectField} options={degreeOption} />
                                                            <span className={css.error}>
                                                                {
                                                                    // @ts-ignore
                                                                    touched.degree && touched.degree[index] && touched.degree[index].name && errors.degree && errors.degree[index] && errors.degree[index].name ? <div>{errors.degree[index].name}</div> : null
                                                                }
                                                            </span>
                                                            <Field as={Input} placeholder={'Название'}
                                                                   name={`degree.${index}.name`}/>
                                                            <span className={css.error}>
                                                                {
                                                                    // @ts-ignore
                                                                    touched.degree && touched.degree[index] && touched.degree[index].start && errors.degree && errors.degree[index] && errors.degree[index].start ? <div>{errors.degree[index].start}</div> : null
                                                                }
                                                            </span>
                                                            <div className={css.dateWrapper}>
                                                                <Field
                                                                    autoComplete="off"
                                                                    placeholderText={'Начало'}
                                                                    locale={'ru'}
                                                                    className={css.datePicker} as={DatePickerField}
                                                                    name={`degree.${index}.start`}
                                                                    selected={null}
                                                                />
                                                                <span className={css.second}/>
                                                                <Field
                                                                    autoComplete="off"
                                                                    placeholderText={'Конец'}
                                                                    locale={'ru'}
                                                                    minDate={values.degree[index].start}
                                                                    className={css.datePicker} as={DatePickerField}
                                                                    name={`degree.${index}.end`}/>
                                                            </div>
                                                            <span className={css.error}>
                                                                {
                                                                    // @ts-ignore
                                                                    touched.degree && touched.degree[index] && touched.degree[index].organizationName && errors.degree && errors.degree[index] && errors.degree[index].organizationName ? <div>{errors.degree[index].organizationName}</div> : null
                                                                }
                                                            </span>
                                                            <Field as={Input}
                                                                   placeholder={'Название организации'}
                                                                   name={`degree.${index}.organizationName`}/>
                                                        </label>
                                                    ))
                                                ) : null}
                                                <button
                                                    className={css.add}
                                                    type="button"
                                                    onClick={() =>
                                                        arrayHelpers.push(deg)
                                                    }
                                                >
                                                    +Добавить регалии
                                                </button>
                                            </div>
                                        );
                                    }}
                                />
                                <label className={css.label}>
                                    <span><span>*</span>Пароль
                        <span className={css.error}>
                                {touched.password1 && errors.password1 ? <div>{errors.password1}</div> : null}
                            </span>
                        </span>
                                    <Field as={Input} name={"password1"} type={'password'}/>
                                </label>
                                <label className={css.label}>
                                    <span><span>*</span>Подтвердите пароль
                        <span className={css.error}>
                                {touched.password2 && errors.password2 ? <div>{errors.password2}</div> : null}
                            </span>
                        </span>
                                    <Field as={Input}
                                           onBlur={handleBlur}
                                           onChange={handleChange}
                                           value={values.password2}
                                           name={"password2"}
                                           type={'password'}/>
                                </label>
                                { errorText ? <div className={css.error} style={{textAlign: 'center', marginLeft: 0}}>{errorText}</div> : null}
                                <div className={css.btnWrapper}>
                                    <GreenBtn type={'submit'}
                                        disabled={isSubmitting}
                                    >
                                        Зарегистрировать
                                    </GreenBtn>
                                </div>
                            </div>
                            <div className={css.imgWrapper}>
                                <div>
                                    <label className={css.upload}>
                                        <InputNone onChange={(e: any) => {
                                            const reader = new FileReader();
                                            reader.readAsDataURL(e.target.files[0]);
                                            reader.onload = (e: any) => {
                                                const newUrl = e.target.result.split(',')
                                                setImg(newUrl[1])
                                            }
                                            setImage(e.target.files[0])
                                        }} type={'file'}/>
                                        <DownloadPictureWrapper>
                                            <img src={img ? "data:image/jpg;base64," + img : pic} alt="pic"/>
                                        </DownloadPictureWrapper>
                                        <GreenDiv>Загрузить фото</GreenDiv>
                                    </label>
                                </div>
                                <div className={css.blue}>
                                    {/*<Link to={'/personal/0/add/time'}>*/}
                                    <GreenBtn onClick={() => setTime(true)}
                                        disabled={isSubmitting}
                                    >Создать расписание</GreenBtn>
                                    {/*</Link>*/}
                                </div>
                            </div>
                        </Form>
                    }
                }
            </Formik>
        </div>
    )
}

const SelectField: React.SFC<any> = ({
                                                                   options,
                                                                   field,
                                                                   form,
                                                               }) => (
    <Select
        options={options}
        name={field.name}
        placeholder={'Тип регалии'}
        styles={{...selectStyles}}
        value={options ? options.find((option:any) => option.value === field.value) : ''}
        onChange={(option: any) => form.setFieldValue(field.name, option.value)}
        onBlur={field.onBlur}
    />
)

export const DatePickerField = ({...props}: any) => {
    const {setFieldValue} = useFormikContext();
    const [field] = useField(props);
    return (
        <DatePicker
            {...field}
            {...props}
            selected={(field.value && new Date(field.value)) || null}
            onChange={val => {
                setFieldValue(field.name, val);
            }}
        />
    );
};

export default CreatePersonal