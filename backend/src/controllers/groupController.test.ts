import type express from 'express'

import type { GroupService } from '../services/groupService'
import type { Group } from '../type'
import { GroupController } from './groupController'

const setup = () => {
  const groups: Group[] = [
    { name: 'テストグループ1', members: ['一郎', '二郎', '三郎'] },
    { name: 'テストグループ2', members: ['太郎', '花子'] },
  ]

  const group: Group = { name: 'テストグループ3', members: ['Alice', 'Bob'] }

  const invalidGroupForName: Group = { name: '', members: ['Alice', 'Bob'] }
  const invalidGroupForMinMembers: Group = {
    name: 'テストグループ3',
    members: ['Alice'],
  }
  const invalidGroupForDuplicateMembers: Group = {
    name: 'テストグループ3',
    members: ['Alice', 'Alice'],
  }

  const error = new Error('テストエラー')

  return {
    groups,
    group,
    invalidGroupForName,
    invalidGroupForMinMembers,
    invalidGroupForDuplicateMembers,
    error,
  }
}

describe('GroupController', () => {
  let req: Partial<express.Request>
  let res: Partial<express.Response>
  let next: Partial<express.NextFunction>
  let mockGroupService: Partial<GroupService>
  let groupController: GroupController

  beforeEach(() => {
    req = {}
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    }
    next = jest.fn()

    mockGroupService = {
      getGroups: jest.fn(),
      getGroupByName: jest.fn(),
      addGroup: jest.fn(),
    }
    groupController = new GroupController(mockGroupService as GroupService)
  })

  describe('getGroupList', () => {
    it('groupの配列が返却される', () => {
      const { groups } = setup()
      ;(mockGroupService.getGroups as jest.Mock).mockReturnValueOnce(groups)
      groupController.getGroupList(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(mockGroupService.getGroups).toHaveBeenCalledWith()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(groups)
    })

    it('GroupServiceのgetGroupsでエラーが発生した場合、NextFunctionが実行される', () => {
      const { error } = setup()
      ;(mockGroupService.getGroups as jest.Mock).mockImplementationOnce(() => {
        throw error
      })
      groupController.getGroupList(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getGroupByName', () => {
    it('groupが返却される', () => {
      const { group } = setup()
      req.params = { name: group.name }
      ;(mockGroupService.getGroupByName as jest.Mock).mockReturnValueOnce(group)
      groupController.getGroupByName(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(mockGroupService.getGroupByName).toHaveBeenCalledWith(group.name)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(group)
    })

    it('groupが存在しない場合、404エラーとなる', () => {
      const { group } = setup()
      req.params = { name: group.name }
      ;(mockGroupService.getGroupByName as jest.Mock).mockReturnValueOnce(
        undefined,
      )
      groupController.getGroupByName(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(mockGroupService.getGroupByName).toHaveBeenCalledWith(group.name)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith('グループが存在しません')
    })

    it('GroupServiceのgetByNameでエラーが発生した場合、NextFunctionが実行される', () => {
      const { group, error } = setup()
      req.params = { name: group.name }
      ;(mockGroupService.getGroupByName as jest.Mock).mockImplementationOnce(
        () => {
          throw error
        },
      )
      groupController.getGroupByName(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(mockGroupService.getGroupByName).toHaveBeenCalledWith(group.name)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('addGroup', () => {
    it('groupが保存できる', () => {
      const { groups, group } = setup()
      req.body = { name: group.name, members: group.members }
      ;(mockGroupService.getGroups as jest.Mock).mockReturnValueOnce(groups)
      ;(mockGroupService.addGroup as jest.Mock).mockImplementationOnce(() => {
        groups.push(group)
      })
      groupController.addGroup(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(mockGroupService.getGroups).toHaveBeenCalledWith()
      expect(mockGroupService.addGroup).toHaveBeenCalledWith(group)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith('グループの作成が成功しました')
    })

    it('すでに存在しているグループを登録しようとすると、400エラーとなる', () => {
      const { groups } = setup()
      req.body = { name: groups[0].name, members: groups[0].members }
      ;(mockGroupService.getGroups as jest.Mock).mockReturnValueOnce(groups)
      groupController.addGroup(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(mockGroupService.getGroups).toHaveBeenCalledWith()
      expect(mockGroupService.addGroup).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.send).toHaveBeenCalledWith(
        '同じ名前のグループが登録されています',
      )
    })

    it('バリデーションエラー: グループ名は必須', () => {
      const { invalidGroupForName } = setup()
      req.body = {
        name: invalidGroupForName.name,
        members: invalidGroupForName.members,
      }
      groupController.addGroup(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(mockGroupService.getGroups).not.toHaveBeenCalled()
      expect(mockGroupService.addGroup).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.send).toHaveBeenCalledWith(['グループ名は必須です'])
    })

    it('バリデーションエラー: メンバーは2人以上', () => {
      const { invalidGroupForMinMembers } = setup()
      req.body = {
        name: invalidGroupForMinMembers.name,
        members: invalidGroupForMinMembers.members,
      }
      groupController.addGroup(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(mockGroupService.getGroups).not.toHaveBeenCalled()
      expect(mockGroupService.addGroup).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.send).toHaveBeenCalledWith(['メンバーは2人以上必要です'])
    })

    it('バリデーションエラー: メンバー名が重複', () => {
      const { invalidGroupForDuplicateMembers } = setup()
      req.body = {
        name: invalidGroupForDuplicateMembers.name,
        members: invalidGroupForDuplicateMembers.members,
      }
      groupController.addGroup(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(mockGroupService.getGroups).not.toHaveBeenCalled()
      expect(mockGroupService.addGroup).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.send).toHaveBeenCalledWith(['メンバー名が重複しています'])
    })

    it('GroupServiceのaddGroupでエラーが発生した場合、NextFunctionが実行される', () => {
      const { groups, group, error } = setup()
      req.body = { name: group.name, members: group.members }
      ;(mockGroupService.getGroups as jest.Mock).mockReturnValueOnce(groups)
      ;(mockGroupService.addGroup as jest.Mock).mockImplementationOnce(() => {
        throw error
      })
      groupController.addGroup(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(mockGroupService.getGroups).toHaveBeenCalledWith()
      expect(mockGroupService.addGroup).toHaveBeenCalledWith(group)
      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
