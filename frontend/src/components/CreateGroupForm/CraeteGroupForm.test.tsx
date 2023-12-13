import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CreateGroupForm from './CreateGroupForm'

const mockOnSubmit = jest.fn()
const user = userEvent.setup()

describe('CreateGroupForm', () => {
  beforeEach(() => {
    render(<CreateGroupForm onSubmit={mockOnSubmit} />)
  })
  it('フォームの内容がSubmitされる', async () => {
    const groupNameInput = screen.getByRole('textbox', { name: 'グループ名' })
    const membersInput = screen.getByRole('textbox', { name: 'メンバー' })
    const button = screen.getByRole('button', { name: 'グループを作成' })
    await user.type(groupNameInput, 'テストグループ1')
    await user.type(membersInput, '太郎, 花子')
    expect(groupNameInput).toHaveValue('テストグループ1')
    expect(membersInput).toHaveValue('太郎, 花子')
    await user.click(button)
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'テストグループ1',
      members: ['太郎', '花子'],
    })
    await waitFor(() => {
      expect(groupNameInput).toHaveValue('')
      expect(membersInput).toHaveValue('')
    })
  })

  it('初期状態でSubmitするとバリデーションエラーが発生する', async () => {
    const groupNameInput = screen.getByRole('textbox', { name: 'グループ名' })
    const membersInput = screen.getByRole('textbox', { name: 'メンバー' })
    const button = screen.getByRole('button', { name: 'グループを作成' })
    await user.click(button)
    expect(groupNameInput).toHaveValue('')
    expect(membersInput).toHaveValue('')
    expect(screen.getByText('グループ名は必須です')).toBeInTheDocument()
    expect(screen.getByText('メンバーは2人以上必要です')).toBeInTheDocument()
  })

  it('重複したメンバーでSubmitするとエラーが発生する', async () => {
    const groupNameInput = screen.getByRole('textbox', { name: 'グループ名' })
    const membersInput = screen.getByRole('textbox', { name: 'メンバー' })
    const button = screen.getByRole('button', { name: 'グループを作成' })
    await user.type(membersInput, '太郎, 太郎')
    await user.click(button)
    expect(groupNameInput).toHaveValue('')
    expect(membersInput).toHaveValue('太郎, 太郎')
    expect(screen.getByText('グループ名は必須です')).toBeInTheDocument()
    expect(screen.getByText('メンバー名が重複しています')).toBeInTheDocument()
  })

  it('Submitに失敗するとエラーが発生する', async () => {
    const spyAlert = jest.spyOn(window, 'alert')
    spyAlert.mockImplementationOnce(() => {})
    mockOnSubmit.mockRejectedValueOnce(new Error('Something Went Wrong'))
    const groupNameInput = screen.getByRole('textbox', { name: 'グループ名' })
    const membersInput = screen.getByRole('textbox', { name: 'メンバー' })
    const button = screen.getByRole('button', { name: 'グループを作成' })
    await user.type(groupNameInput, 'テストグループ1')
    await user.type(membersInput, '太郎, 花子')
    expect(groupNameInput).toHaveValue('テストグループ1')
    expect(membersInput).toHaveValue('太郎, 花子')
    await user.click(button)
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'テストグループ1',
      members: ['太郎', '花子'],
    })
    await waitFor(() => expect(spyAlert).toHaveBeenCalledWith('登録に失敗'))
  })
})
