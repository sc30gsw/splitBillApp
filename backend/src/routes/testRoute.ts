import express from 'express'
import fs from 'fs'

import type { TestController } from '../controllers/testController'

const router = express.Router()

export const testRoutes = (controller: TestController): express.Router => {
  router.get('/init', controller.init)
  return router
}
