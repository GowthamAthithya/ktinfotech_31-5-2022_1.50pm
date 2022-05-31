import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Popconfirm, Form, Dropdown, Space, Menu, DatePicker, Select, message } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import Dashboardnav from './dashboardnav'
import HeaderNav from '../headernav';
import { db } from '../Firebase/firebase'
import { addDoc, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import moment from 'moment';
import Cookies from 'universal-cookie';
import { async } from '@firebase/util';
const cookies = new Cookies();

const { Option, OptGroup } = Select;


const EditableTable = (props) => {
  const [keyWord, setKeyWord] = useState()
  const [wordChange, setWordChange] = useState()
  const [wordStatus, setWordStatus] = useState()
  const [data, _data] = useState([]);
  const [website, setWebSite] = useState()
  const [completedDate, setCompletedDate] = useState()
  const [firstTime, setFirstTime] = useState(false)
  const [name, setName] = useState()
  const usersRef = collection(db, 'Users')

  const userData = cookies.get('userData');

  const usersIndividualRef = doc(db, 'Users', userData?.id);

  useEffect(() => {
    fetchData();
    setFirstTime(true);
    setCompletedDate(moment().format('DD/MM/YYYY'))
  }, [])

  useEffect(() => {
    if (firstTime) {
      _data([...data, {}])
    }
  }, [props?.addRow])

  const fetchData = async () => {
    const userData = await getDocs(usersRef);
    const usersData = userData.docs.map((doc) => ({ ...doc.data(), created_at: moment(doc.created_at), id: doc.id }));
    const userCookieData = cookies.get('userData');
    const user = usersData?.filter(user => user.name == userCookieData.name)
    let userTable = [];

    userCookieData?.isAdmin ?
      usersData?.map(user => {
        user?.date?.map(el =>
          userTable.push({
            date: el.date,
            status: el.loginStatus,
            taskStatus: el.taskStatus,
            clockIn: el?.clockIn,
            clockOut: el?.clockOut,
            hours: el?.hours,
            totalWords: el?.totalWords || 'NA',
            completedDate: el?.completedDate,
            wordsCount: el?.wordsCount,
            approval: el?.approval,
            comments: el?.comments,
            website: el?.website,
            keyword: el.keywords,
            name: user.name
          })
        )
      })
      : user[0]?.date?.map(el =>
        userTable.push({
          date: el.date,
          status: el.loginStatus,
          taskStatus: el.taskStatus,
          clockIn: el?.clockIn,
          clockOut: el?.clockOut,
          hours: el?.hours,
          totalWords: el?.totalWords || 'NA',
          completedDate: el?.completedDate,
          wordsCount: el?.wordsCount,
          approval: el?.approval,
          comments: el?.comments,
          website: el?.website,
          keyword: el.keywords,
        })
      )

    _data(userTable)

  }

  const handleKeyChange = (e) => {
    setKeyWord(e.target.value);

  }

  const handleWordCountChange = (e) => {
    setWordChange(e.target.value);

  }

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleTaskStatus = (e) => {
    setWordStatus(e)
  }

  const handleWebsiteChange = (e) => {
    setWebSite(e.target.value)
  }

  const handleCompletedDate = (e) => {
    setCompletedDate(moment(e).format('DD/MM/YYYY'))
  }

  const handleSubmit = async () => {
    const getData = await getDoc(usersIndividualRef);
    let Date = moment().format('YYYY/MM/DD')

    const getUserData = getData?.data();
    const dataWithoutCurrentDate = getUserData?.date?.filter(d => d.date !== Date);
    const dataWithCurrentDate = getUserData?.date?.filter(d => d.date == Date);
    if (!dataWithCurrentDate) {
      message.error('Please clockIn to create Task');
    }
    const data = await updateDoc(usersIndividualRef, {
      date: dataWithoutCurrentDate ? [...dataWithoutCurrentDate,
      {
        ...dataWithCurrentDate[0],
        keywords: keyWord,
        wordsCount: wordChange,
        completedDate: completedDate,
        website: website,
        taskStatus: wordStatus
      }]
        : [
          {
            ...dataWithCurrentDate[0],
            keywords: keyWord,
            wordsCount: wordChange,
            completedDate: completedDate,
            website: website,
            taskStatus: wordStatus
          }]
    });
    message.success('Task Created successfully');
    fetchData();

  }

  const columns = [
    {
      title: userData?.isAdmin ? 'Name' : '',
      width: userData?.isAdmin ? 160 : 0,
      dataIndex: 'name',
      fixed: 'left',
      render: ((text) => text ? text :
        <input type='text' style={{ width: userData?.isAdmin ? '150px' : 0 }} value={text || name} onChange={handleNameChange}></input>
      )
    },
    {
      title: 'Keyword',
      width: 150,
      dataIndex: 'keyword',
      render: ((text) => {
        return (
          <input type='text' style={{ width: '150px' }} value={text || keyWord} onChange={handleKeyChange}></input>
        )
      })
    },
    {
      title: 'Status',
      dataIndex: 'taskStatus',
      width: 150,
      render: ((text) => {
        return (
          <Select style={{ width: '150px' }} placeholder='Status' defaultValue={text || wordStatus || 'Not Available'} onChange={handleTaskStatus}>
            <Option value='Writing'>Writing</Option>
            <Option value='Submitting For Review'>Submitting For Review</Option>
          </Select>
        )
      })
    },
    {
      title: 'Completed Date',
      dataIndex: 'completedDate',
      width: 150,
      render: ((text) => {
        return (<DatePicker onChange={handleCompletedDate} defaultValue={moment(text ? text : completedDate, 'DD/MM/YYYY')} format={'DD/MM/YYYY'} />)
      })
    },
    {
      title: 'Words Count',
      dataIndex: 'wordsCount',
      render: ((text) => {
        return (
          <input type='text' style={{ width: '100px' }} value={text || wordChange} onChange={handleWordCountChange}></input>
        )
      })
    },
    {
      title: 'Approval',
      dataIndex: 'approval',
      render: ((text) => text ? text : 'Not Yet Approved')
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      render: ((text) => text ? text : 'No Comments yet')
    },
    {
      title: 'Website',
      dataIndex: 'website',
      render: ((text) => {
        return (
          <input type='text' style={{ width: '100px' }} value={text || website} onChange={handleWebsiteChange}></input>
        )
      })
    },
    {
      title: 'Submit',
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: () => <Button onClick={handleSubmit}>Submit</Button>,
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        scroll={{
          x: 1400,
        }}
      />
    </>)
};

export default function Task() {
  const [addRow, setAddRow] = useState()
  const userData = cookies.get('userData');

  return (
    <div>
      <HeaderNav />
      <div className='dashboard'>
        <Dashboardnav />
        <div className='dashboardContent'>
          {userData?.isAdmin ? <Button onClick={() => addRow ? setAddRow(false) : setAddRow(true)} type='primary'>Add Task Row</Button> : ''}
          <EditableTable addRow={addRow} />
        </div>
      </div>
    </div>
  )
}
