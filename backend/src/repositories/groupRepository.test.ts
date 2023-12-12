import fs from 'fs'

import type { Group } from '../type'
import { GroupRepository } from './groupRepository'

jest.mock('fs')

describe('GroupRepository', () => {
  const mockFs = jest.mocked(fs)

  let repository: GroupRepository

  beforeEach(() => {
    mockFs.existsSync.mockReset()
    mockFs.readFileSync.mockReset()
    mockFs.writeFileSync.mockReset()
    repository = new GroupRepository('groups.json')
  })

  describe('loadGroups', () => {
    it('グループ一覧が取得できる', () => {
      const groups: Group[] = [
        { name: 'テストグループ1', members: ['一郎', '二郎', '三郎'] },
        { name: 'テストグループ2', members: ['太郎', '花子'] },
      ]
      const mockData = JSON.stringify(groups)
      mockFs.existsSync.mockReturnValueOnce(true)
      mockFs.readFileSync.mockReturnValueOnce(mockData)
      const result = repository.loadGroups()
      expect(result).toEqual(groups)
      expect(mockFs.existsSync).toBeCalledWith('groups.json')
      expect(mockFs.readFileSync).toBeCalledWith('groups.json', 'utf8')
    })

    it('ファイルが存在しない場合は、空の配列が返却される', () => {
      mockFs.existsSync.mockReturnValueOnce(false)
      const result = repository.loadGroups()
      expect(result).toEqual([])
      expect(mockFs.existsSync).toBeCalledWith('groups.json')
      expect(mockFs.readFileSync).toBeCalledTimes(0)
    })
  })

  describe('saveGroup', () => {
    it('groupが保存されること', () => {
      const group: Group = {
        name: 'テストグループ1',
        members: ['一郎', '二郎', '三郎'],
      }
      mockFs.existsSync.mockReturnValueOnce(true)
      mockFs.readFileSync.mockReturnValueOnce(JSON.stringify([]))
      repository.saveGroup(group)
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'groups.json',
        JSON.stringify([group]),
      )
    })
  })
})
