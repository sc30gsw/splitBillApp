import type express from 'express'
import fs from 'fs'

import { TestController } from './testController'

jest.mock('fs')
const GROUP_FILE_PATH = `${process.env.DATA_PATH}/groups.json`
const EXPENSE_FILE_PATH = `${process.env.DATA_PATH}//expenses.json`
describe('TestController', () => {
  let req: Partial<express.Request>
  let res: Partial<express.Response>
  let next: Partial<express.NextFunction>
  let testController: TestController

  const mockFs = jest.mocked(fs)

  beforeEach(() => {
    req = {}
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }
    next = jest.fn()
    mockFs.writeFileSync.mockReset()

    testController = new TestController()
  })

  describe('init', () => {
    it('テストデータの初期化が行われる', () => {
      testController.init(
        req as express.Request,
        res as express.Response,
        next as express.NextFunction,
      )
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        GROUP_FILE_PATH,
        JSON.stringify([]),
      )
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        EXPENSE_FILE_PATH,
        JSON.stringify([]),
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith('テストファイルを初期化しました')
    })
  })
})
