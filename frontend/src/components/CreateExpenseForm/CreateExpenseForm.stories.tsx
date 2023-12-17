import type { Meta, StoryObj } from '@storybook/react'

import CreateExpenseForm from './CreateExpenseForm'
import { Group } from '../../type'

const meta = {
  title: 'CreateExpenseForm',
  component: CreateExpenseForm,
} as Meta<typeof CreateExpenseForm>

export default meta

type Story = StoryObj<typeof CreateExpenseForm>

const group: Group = {
  name: 'テストグループ1',
  members: ['一郎', '二郎', '三郎']
}

export const Default: Story = {
  args: {
    group,
    onSubmit: async () =>
      new Promise((resolve) => setTimeout(() => resolve(), 1000)),
  },
}
