import { Container } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

import { useApi } from '../../hooks/useApi'
import type { formInputs } from '../CreateGroupForm/CreateGroupForm'
import CreateGroupForm from '../CreateGroupForm/CreateGroupForm'

const CreateGroupPage = () => {
  const navigate = useNavigate()
  const { postData: postGroup } = useApi(
    `${import.meta.env.VITE_API_BASE_URL}/groups`,
  )

  // フォームが送信されたときの処理
  const onSubmit = async (data: formInputs) => {
    try {
      await postGroup(data, `${import.meta.env.VITE_API_BASE_URL}/groups`)
      navigate(`/group/${data.name}`)
    } catch (err) {
      console.error(err)
      throw new Error('グループの作成に失敗')
    }
  }

  return (
    <Container m={6}>
      <CreateGroupForm onSubmit={onSubmit} />
    </Container>
  )
}

export default CreateGroupPage
