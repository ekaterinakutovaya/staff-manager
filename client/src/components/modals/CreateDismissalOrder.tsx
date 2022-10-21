import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import {
    Modal,
    Form,
    Input,
    Button,
    DatePicker,
    InputNumber,
    Space,
    Row,
    Col,
    notification,
    Divider,
    Select,
    Typography
} from 'antd';
import moment from 'moment';

import contractService from "api/contract.service";
import orderService from "api/order.service";
import { selectOrders, selectEmployees, selectContracts, selectCompanies } from "store/selectors";
import { Employee, Contract } from "store/types";

const dateFormatList = ['DD.MM.YYYY', 'DD.MM.YY'];
const { Option } = Select;

type CreateDismissalOrderProps = {
    open: boolean;
    setOpen: (boolean: boolean) => void;
}

type OnFinish = {
    orderNo: number;
    orderDate: Date;
    dismissalDate: Date;
    groundsForDismissal: string;
    compensationDays: number;
    averageSalary: number;
}

const CreateDismissalOrder: React.FC<CreateDismissalOrderProps> = ({open, setOpen}) => {
    const [form] = Form.useForm();
    const { orders } = useSelector(selectOrders);
    const { employees } = useSelector(selectEmployees);
    const { contracts } = useSelector(selectContracts);
    const {companyDetails} = useSelector(selectCompanies);
    const [activeEmployees, setActiveEmployees] = useState([]);
    const [employeeId, setEmployeeId] = useState(null);
    const [companyId, setCompanyId] = useState(null);
    const [registerDate, setRegisterDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedValue, setSelectedValue] = useState(null);

    useEffect(() => {
        setActiveEmployees(employees.filter((emp: Employee) => emp.isEmployed === true));

        if (companyDetails.length > 0) {
            setRegisterDate(companyDetails[0]?.registerDate);
        }
        form.setFieldsValue({
            orderNo: orders.length + 1,
            orderDate: moment(Date.now()),
            dismissalDate: moment(Date.now()),
            groundsForDismissal: 'Заявление',
            compensationDays: 5,
            averageSalary: 1500000
        })

        return () => {
            form.resetFields();
            setSelectedValue(null);
        }
    }, [open])
    

    const onFinish = async (values: OnFinish) => {
        console.log('Success:', values);
        setLoading(true);
        const {dismissalDate} = values;

        const orderTypeId = 2; 
        const contract = contracts.filter((contract: Contract) => contract.employeeId === employeeId && contract.dismissalDate === null)[0];

        if (contract) {
            let contractId = contract.id;
            contractService.cancelContract({ dismissalDate, employeeId });
            orderService.createDismissalOrder({ values, orderTypeId, employeeId, contractId, companyId })
            .then(() => {
                form.resetFields();
                setSelectedValue(null);
                setLoading(false);
                setOpen(false);
            })
        } else {
            notification.error({
                message: `Договор с указанным физ.лицом не найден!`,
                placement: 'top',
            });
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo:any) => {
        console.log('Failed:', errorInfo);
        setLoading(false);
    };

    const onCancel = () => {
        setOpen(false);
        setSelectedValue(null);
        form.resetFields();
    }

    const onSelectChange = (value: string) => {
        setSelectedValue(value);
        setEmployeeId(Number(value));
        const foundEmployee = employees.filter((emp: Employee) => emp.id === Number(value))[0];
        if (foundEmployee) {
            const { companyId } = foundEmployee;
            setCompanyId(companyId);
        }

    };

    const onSelectSearch = (value: string) => {
        setSelectedValue(value);
        setEmployeeId(Number(value));
        const foundEmployee = employees.filter((emp: Employee) => emp.id === Number(value))[0];
        if (foundEmployee) {
            const { companyId } = foundEmployee;
            setCompanyId(companyId);
        }
    };

    return (
        <>
            <Modal
                title="Увольнение из организации. Новый приказ*"
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
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 16 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    preserve={false}
                >
                    <Form.Item label="Номер">
                        <Input.Group size="default">

                            <Row gutter={10}>
                                <Col span={4}>
                                    <Form.Item name="orderNo" style={{
                                        textAlign: 'center'
                                    }}
                                        rules={[{ required: true, message: 'Пожалуйста введите номер приказа!' }]}
                                    >
                                        <InputNumber />
                                    </Form.Item>
                                </Col>
                                <Col span={9}>
                                    <Form.Item name="orderDate" label="от" rules={[
                                        {
                                            validator: (_, value) => {
                                                if (value === null) {
                                                    return Promise.reject('Пожалуйста введите дату приказа!');
                                                } else if (moment(value).isBefore(registerDate, 'day'))
                                                    return Promise.reject('Дата приказа не может быть меньше даты регистрации организации!');
                                                else {
                                                    return Promise.resolve();
                                                }
                                            }
                                        }
                                    ]}>
                                        <DatePicker format={dateFormatList} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Input.Group>
                    </Form.Item>

                    <Form.Item label="Физ.лицо">
                        <Select
                            showSearch
                            placeholder="Выбрать физ.лицо"
                            optionFilterProp="children"
                            onChange={onSelectChange}
                            onSearch={onSelectSearch}
                            filterOption={(input, option) =>
                                (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                            }
                            allowClear
                            value={selectedValue}
                        >
                            {activeEmployees?.map((emp: Employee, index: number) => (
                                <Option key={index} value={emp.id} label={`${emp.employeeFamilyName} ${emp.employeeFirstName} ${emp.employeePatronymic}`}>

                                    {`${emp.employeeFamilyName} ${emp.employeeFirstName} ${emp.employeePatronymic}`}

                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
            

                    <Form.Item label="Дата увольнения" name="dismissalDate" rules={[
                        {
                            validator: (_, value) => {
                                if (value === null) {
                                    return Promise.reject('Пожалуйста введите дату приказа!');
                                } else if (moment(value).isBefore(registerDate, 'day'))
                                    return Promise.reject('Дата приказа не может быть меньше даты регистрации организации!');
                                else {
                                    return Promise.resolve();
                                }
                            }
                        }
                    ]}>
                        <DatePicker format={dateFormatList} />
                    </Form.Item>


                    <Form.Item label="Основание увольнения" name="groundsForDismissal" wrapperCol={{
                        span: 14
                    }} rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Divider/>
                    
                    <Form.Item label="Дней компенсации за неисп.отпуск" name="compensationDays" wrapperCol={{
                        span: 14
                    }} rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]}
                    >
                        <InputNumber style={{
                            textAlign: 'center'
                        }} />
                    </Form.Item>
                    <Form.Item label="Среднемес. заработная плата" name="averageSalary" wrapperCol={{
                        span: 14
                    }} rules={[{ required: true, message: 'Пожалуйста заполните поле!' }]}
                    >
                        <InputNumber step="100000" style={{
                            width: 200,
                        }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                        />
                    </Form.Item>


                    <Form.Item wrapperCol={{
                        offset: 8,
                        span: 16,
                    }}>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
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

export default CreateDismissalOrder;