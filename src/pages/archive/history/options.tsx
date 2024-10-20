import { AlertStatus } from '@/api/enum'
import { ActionKey, AlertStatusData } from '@/api/global'
import { AlarmHistoryItem } from '@/api/realtime/history'
import type { SearchFormItem } from '@/components/data/search-box'
import TimeDifference from '@/components/layout/header-message'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import OverflowTooltip from '@/components/overflowTooltip'
import { Button, Space } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '规则组名称',
        allowClear: true
      }
    }
  },
  {
    name: 'alarmStatuses',
    label: '状态',
    dataProps: {
      type: 'select',
      itemProps: {
        placeholder: '规则组状态',
        allowClear: true,
        mode: 'multiple',
        options: Object.entries(AlertStatusData).map(([key, val]) => {
          return {
            label: val,
            value: +key
          }
        })
      }
    }
  }
]

interface GroupColumnProps {
  onHandleMenuOnClick: (item: AlarmHistoryItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<AlarmHistoryItem> => {
  const { onHandleMenuOnClick, current, pageSize } = props
  const tableOperationItems = (_: AlarmHistoryItem): MoreMenuProps['items'] => [
    {
      key: ActionKey.OPERATION_LOG,
      label: (
        <Button size='small' type='link'>
          事件日志
        </Button>
      )
    }
  ]

  return [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 60,
      fixed: 'left',
      render: (_, __, index: number) => {
        return <span>{(current - 1) * pageSize + index + 1}</span>
      }
    },
    {
      title: '状态',
      dataIndex: 'alertStatus',
      key: 'alertStatus',
      width: 200,
      render: (status: AlertStatus, record: AlarmHistoryItem) => {
        return (
          <Space direction='horizontal'>
            {AlertStatusData[status]}{' '}
            {status !== AlertStatus.ALERT_STATUS_RESOLVED && (
              <TimeDifference timestamp={dayjs(record.startsAt).unix() * 1000} />
            )}
          </Space>
        )
      }
    },
    {
      title: '告警时间',
      dataIndex: 'startsAt',
      key: 'startsAt',
      align: 'center',
      width: 160
    },
    {
      title: '名称',
      dataIndex: 'summary',
      key: 'summary',
      width: 400
    },
    {
      title: '描述',
      dataIndex: 'annotations',
      key: 'annotations',
      render: (annotations: Record<string, string>) => {
        return <OverflowTooltip content={annotations?.['description'] || '-'} maxWidth='300px' />
      }
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (_, record: AlarmHistoryItem) => (
        <Space size={20}>
          <Button size='small' type='link' onClick={() => onHandleMenuOnClick(record, ActionKey.DETAIL)}>
            详情
          </Button>
          {tableOperationItems && tableOperationItems?.length > 0 && (
            <MoreMenu
              items={tableOperationItems(record)}
              onClick={(key: ActionKey) => {
                onHandleMenuOnClick(record, key)
              }}
            />
          )}
        </Space>
      )
    }
  ]
}
