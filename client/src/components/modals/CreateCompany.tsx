import React, { useEffect } from 'react';
import { useSelector } from "react-redux";
import {
    Modal,
    Form,
    Input,
    Button,
    DatePicker,
    Space
} from 'antd';
import 'moment/locale/ru';

import { useAppDispatch } from "store/store";
import { createCompany } from "../../store/actionCreators/companyAction";
import { selectAuth } from 'store/selectors';
import { CompanyDetails } from "store/types";
import moment from 'moment';

const dateFormatList = ['DD.MM.YYYY', 'DD.MM.YY'];

type CreateCompanyProps = {
    open: boolean;
    setOpen: (boolean: boolean) => void;
}


const CreateCompany: React.FC<CreateCompanyProps> = ({ open, setOpen }) => {
    const dispatch = useAppDispatch();
    const { sub } = useSelector(selectAuth);
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            companyName: 'OOO "KIMPLE"',
            address: `Toshkent shahri, Yunusobod tumani, Osiyo ko'chasi, 37-uy`,
            phoneNumber: '+ (998) 99 999 99 99',
            registerDate: moment(Date.now()),
            companyINN: '999999999',
            bankAccount: '20208000005046738001',
            bankName: `АТ «Алокабанк» Амалиёт бошкармаси`,
            bankCode: '00963',
            companyOKED: '69101',
            manager: 'Аблакулов О. Д.'
        })
    }, [])

    const onFinish = (values:CompanyDetails) => {
        // console.log('Success:', values);
        dispatch(createCompany({values, sub}))
            .then(() => {
                form.resetFields();
                setOpen(false)
            })
    };

    const onFinishFailed = (errorInfo:any) => {
        console.log('Failed:', errorInfo);
    };


    const onCancel = () => {
        setOpen(false);
        form.resetFields();
    }


    return (
        <>
            <Modal
                title="Организации. Создание*"
                centered
                open={open}
                onOk={() => setOpen(false)}
                onCancel={() => setOpen(false)}
                width={1000}
                cancelText="Отмена"
                okText="Создать"
                footer={null}
                getContainer={false}
                destroyOnClose
                forceRender 
            >
                <Form
                    form={form}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    preserve={false}
                >
                    <Form.Item label="Наименование" name="companyName" rules={[{ required: true, message: 'Пожалуйста введите наименование!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Адрес" name="address" rules={[{ required: true, message: 'Пожалуйста введите адрес организации!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Телефон" name="phoneNumber" rules={[{ required: true, message: 'Пожалуйста введите телефон организации!' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Дата регистрации" name="registerDate" rules={[{ required: true, message: 'Пожалуйста введите дату регистрации!' }]}>
                        <DatePicker format={dateFormatList}/>
                    </Form.Item>
                    <Form.Item label="ИНН" name="companyINN" rules={[{
                        required: true,
                        message: 'Пожалуйста введите ИНН организации!'
                    }]}>
                        <Input
                            style={{
                                width: 150,
                            }}
                            maxLength={9}
                        />
                    </Form.Item>
                    <Form.Item label="р/с" name="bankAccount" rules={[{
                        required: true,
                        message: 'Пожалуйста введите расчетный счет организации!'
                    }]}>
                        <Input
                            style={{
                                width: 200,
                            }}
                            maxLength={20}
                        />
                    </Form.Item>

                    <Form.Item label="банк" name="bankName" rules={[{ required: true, message: 'Пожалуйста введите наименование банка!' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="МФО" name="bankCode" rules={[{
                        required: true,
                        message: 'Пожалуйста введите МФО банка!'
                    }]}>
                        <Input
                            style={{
                                width: 70,
                            }}
                            maxLength={5}
                        />
                    </Form.Item>

                    <Form.Item label="ОКЭД" name="companyOKED" rules={[{
                        required: true,
                        message: 'Пожалуйста введите ОКЭД организации!'
                    }]}>
                        <Input
                            style={{
                                width: 70,
                            }}
                            maxLength={5}
                        />
                    </Form.Item>

                    <Form.Item label="Руководитель" name="manager" rules={[{
                        required: true,
                        message: 'Пожалуйста введите ФИО руководителя организации!'
                    }]}>
                        <Input />
                    </Form.Item>


                    <Form.Item wrapperCol={{
                        offset: 8,
                        span: 16,
                    }}>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Создать
                            </Button>
                            <Button onClick={onCancel}>
                                Отмена
                            </Button>
                        </Space>
                        
                    </Form.Item>

                </Form>
            </Modal>
        </>
    );
};

export default CreateCompany;