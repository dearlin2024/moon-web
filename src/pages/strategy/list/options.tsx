import { Condition, Status, SustainType } from '@/api/enum'
import { ActionKey, StatusData } from '@/api/global'
import { DatasourceItem, DictItem, StrategyGroupItem } from '@/api/model-types'
import { listStrategyGroup } from '@/api/strategy'
import type { SearchFormItem } from '@/components/data/search-box'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import { Avatar, Badge, Button, Space, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { StrategyLevelTemplateType } from './metric-edit-modal'

export type StrategyLabelType = {
  alarmGroupIds: number[]
  name: string
  value: string
}

export type LevelItemType = {
  condition: Condition
  count: number
  duration: number
  levelId: number
  sustainType: SustainType
  threshold: number
  status: Status
  strategyLabels: StrategyLabelType[]
  id?: number
}

export type MetricEditModalFormData = {
  name: string
  expr: string
  remark: string
  datasource?: string
  labels: {
    key: string
    value: string
  }[]
  annotations: {
    summary: string
    description: string
  }
  categoriesIds: number[]
  groupId: number
  step: number
  datasourceIds: number[]
  strategyLevel: StrategyLevelTemplateType[]
  alarmGroupIds: number[]
}

export const getStrategyGroups = (keyword: string) => {
  return listStrategyGroup({
    pagination: {
      pageNum: 1,
      pageSize: 10
    },
    keyword
  }).then(({ list }) => {
    return list.map((item) => {
      return {
        label: item.name,
        value: item.id
      }
    })
  })
}

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '策略名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '请输入策略名称',
        allowClear: true
      }
    }
  },
  {
    name: 'teamId',
    label: '策略组',
    dataProps: {
      type: 'select-fetch',
      itemProps: {
        selectProps: {
          placeholder: '请选择策略组',
          mode: 'multiple',
          maxTagCount: 'responsive'
        },
        handleFetch: getStrategyGroups,
        defaultOptions: []
      }
    }
  },
  {
    name: 'status',
    label: '策略状态',
    dataProps: {
      type: 'select',
      itemProps: {
        placeholder: '策略状态',
        allowClear: true,
        options: Object.entries(StatusData).map(([key, value]) => {
          return {
            label: value.text,
            value: Number(key)
          }
        })
      }
    }
  }
]

interface GroupColumnProps {
  onHandleMenuOnClick: (item: StrategyGroupItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<StrategyGroupItem> => {
  const { onHandleMenuOnClick } = props
  const tableOperationItems = (record: StrategyGroupItem): MoreMenuProps['items'] => [
    record.status === Status.StatusDisable
      ? {
          key: ActionKey.ENABLE,
          label: (
            <Button type='link' size='small'>
              启用
            </Button>
          )
        }
      : {
          key: ActionKey.DISABLE,
          label: (
            <Button type='link' size='small' danger>
              禁用
            </Button>
          )
        },

    {
      key: ActionKey.EDIT,
      label: (
        <Button size='small' type='link'>
          编辑
        </Button>
      )
    },
    {
      key: ActionKey.IMMEDIATELY_PUSH,
      label: (
        <Button size='small' type='link'>
          立即推送
        </Button>
      )
    },
    {
      key: ActionKey.OPERATION_LOG,
      label: (
        <Button size='small' type='link'>
          操作日志
        </Button>
      )
    },
    {
      key: ActionKey.DELETE,
      label: (
        <Button type='link' size='small' danger>
          删除
        </Button>
      )
    }
  ]

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '数据源',
      dataIndex: 'datasource',
      key: 'datasource',
      width: 160,
      render: (record: DatasourceItem[]) => {
        if (!record || !record.length) return '-'
        if (record.length === 1) {
          const { name } = record[0]
          return <div>{name}</div>
        }
        return (
          <Avatar.Group maxCount={2} shape='square' size='small'>
            {record.map((item, index) => {
              return (
                <Tooltip title={item.name} key={index}>
                  <Avatar key={item.id}>{item.name}</Avatar>
                </Tooltip>
              )
            })}
          </Avatar.Group>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 160,
      render: (status: Status) => {
        const { text, color } = StatusData[status]
        return <Badge color={color} text={text} />
      }
    },
    {
      title: '策略组',
      dataIndex: 'group',
      key: 'group',
      width: 160,
      render: (groupInfo: StrategyGroupItem) => {
        return groupInfo?.name || '-'
      }
    },
    {
      title: '策略类型',
      dataIndex: 'categories',
      key: 'categories',
      width: 160,
      ellipsis: true,
      render: (categories: DictItem[]) => {
        return (
          <Tooltip placement='top' title={<div>{categories.map((item) => item.name).join('，')}</div>}>
            <div>{categories.map((item) => item.name).join('，')}</div>
          </Tooltip>
        )
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (record: StrategyGroupItem) => (
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
