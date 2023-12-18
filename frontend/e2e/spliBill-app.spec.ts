import { expect, test } from '@playwright/test'
import axios from 'axios'

test.describe('splitBillApp', () => {
  test.beforeEach(async ({ page }) => {
    await axios.get('http://localhost:3000/init')
    await page.goto('http://localhost:3001')
  })

  test.describe('グループ作成', () => {
    test('グループが作成され、支出登録ページに遷移する', async ({ page }) => {
      const groupNameInput = page.getByRole('textbox', { name: 'グループ名' })
      await groupNameInput.fill('group1')
      await expect(groupNameInput).toHaveValue('group1')
      const memberListInput = page.getByRole('textbox', { name: 'メンバー' })
      await memberListInput.fill('太郎, 花子')
      await expect(memberListInput).toHaveValue('太郎, 花子')
      const button = page.getByRole('button', { name: 'グループを作成' })
      await button.click()
      // URLにgroupと作成したgroup1が含まれていること
      await expect(page).toHaveURL(/.*group\/group1/)
    })

    test('バリデーションエラーが存在する場合、グループが作成されずページ遷移しない', async ({
      page,
    }) => {
      const groupNameInput = page.getByRole('textbox', { name: 'グループ名' })
      const memberListInput = page.getByRole('textbox', { name: 'メンバー' })
      expect(groupNameInput).toHaveValue('')
      expect(memberListInput).toHaveValue('')
      const button = page.getByRole('button', { name: 'グループを作成' })
      await button.click()
      expect(page.getByText('グループ名は必須です')).toBeVisible()
      expect(page.getByText('メンバーは2人以上必要です')).toBeVisible()
      await expect(page).toHaveURL('http://localhost:3001/')
    })

    test('バリデーションエラー（メンバーの重複）が存在する場合、グループが作成されずページ遷移しない', async ({
      page,
    }) => {
      const groupNameInput = page.getByRole('textbox', { name: 'グループ名' })
      const memberListInput = page.getByRole('textbox', { name: 'メンバー' })
      await groupNameInput.fill('group1')
      await memberListInput.fill('太郎, 太郎')
      expect(memberListInput).toHaveValue('太郎, 太郎')
      expect(groupNameInput).toHaveValue('group1')
      const button = page.getByRole('button', { name: 'グループを作成' })
      await button.click()
      await expect(page.getByText('メンバー名が重複しています')).toBeVisible()
      await expect(page).toHaveURL('http://localhost:3001/')
    })
  })

  test.describe('支出作成', () => {
    test.beforeEach(async ({ page }) => {
      const groupNameInput = page.getByRole('textbox', { name: 'グループ名' })
      await groupNameInput.fill('group1')
      const memberListInput = page.getByRole('textbox', { name: 'メンバー' })
      await memberListInput.fill('太郎, 花子')
      const button = page.getByRole('button', { name: 'グループを作成' })
      await button.click()
    })

    test('支出が登録され、清算リストが追加される', async ({ page }) => {
      const expenseNameInput = page.getByRole('textbox', { name: '支出名' })
      const amountInput = page.getByRole('spinbutton', { name: '金額' })
      const payerInput = page.getByRole('combobox', { name: '支払うメンバー' })
      expect(expenseNameInput).toHaveValue('')
      expect(amountInput).toHaveValue('')
      expect(payerInput).toHaveValue('')
      await expenseNameInput.fill('expense1')
      await amountInput.fill('1000')
      await payerInput.selectOption({ label: '太郎' })
      expect(expenseNameInput).toHaveValue('expense1')
      expect(amountInput).toHaveValue('1000')
      expect(payerInput).toHaveValue('太郎')
      const button = page.getByRole('button', { name: '支出を登録' })
      await button.click()
      await expect(page).toHaveURL(/.*group\/group1/)
      await expect(page.getByRole('listitem')).toHaveCount(1)
      await expect(page.getByRole('listitem')).toHaveText(['花子 → 太郎500円'])
    })

    test('バリデーションエラーの場合、支出が登録されず、清算リストが追加されない', async ({
      page,
    }) => {
      const expenseNameInput = page.getByRole('textbox', { name: '支出名' })
      const amountInput = page.getByRole('spinbutton', { name: '金額' })
      const payerInput = page.getByRole('combobox', { name: '支払うメンバー' })
      expect(expenseNameInput).toHaveValue('')
      expect(amountInput).toHaveValue('')
      expect(payerInput).toHaveValue('')
      const button = page.getByRole('button', { name: '支出を登録' })
      await button.click()
      await expect(page.getByText('支出名は必須です')).toBeVisible()
      await expect(
        page.getByText('金額は1円以上の整数で必須です'),
      ).toBeVisible()
      await expect(page.getByText('支払うメンバーは必須です')).toBeVisible()
      expect(payerInput).toHaveValue('')
      expect(expenseNameInput).toHaveValue('')
      expect(amountInput).toHaveValue('')

      await expect(page).toHaveURL(/.*group\/group1/)
      await expect(page.getByRole('listitem')).toHaveCount(0)
    })

    test('バリデーションエラー（金額がマイナス）の場合、支出が登録されず、清算リストが追加されない', async ({
      page,
    }) => {
      const expenseNameInput = page.getByRole('textbox', { name: '支出名' })
      const amountInput = page.getByRole('spinbutton', { name: '金額' })
      const payerInput = page.getByRole('combobox', { name: '支払うメンバー' })
      expect(expenseNameInput).toHaveValue('')
      expect(amountInput).toHaveValue('')
      expect(payerInput).toHaveValue('')
      await amountInput.fill('-1')
      const button = page.getByRole('button', { name: '支出を登録' })
      await button.click()
      await expect(page.getByText('支出名は必須です')).toBeVisible()
      await expect(
        page.getByText('金額は1円以上の整数で必須です'),
      ).toBeVisible()
      await expect(page.getByText('支払うメンバーは必須です')).toBeVisible()
      expect(expenseNameInput).toHaveValue('')
      expect(amountInput).toHaveValue('-1')
      expect(payerInput).toHaveValue('')
      await expect(page).toHaveURL(/.*group\/group1/)
      await expect(page.getByRole('listitem')).toHaveCount(0)
    })
  })
})
