import { useUserStore } from '@/store/userStore'

const apiUrl = import.meta.env.VITE_API_BASE_URL

async function uploadPhoto(photo: File) {
  const token = useUserStore().token.value
  if (!token) {
    return
  }
  const formData = new FormData()

  if (photo instanceof File) {
    formData.append('file', photo, photo.name)
  }
  else {
    console.error('Invalid file object:', photo)
    throw new Error('Invalid file object')
  }

  try {
    const response = await fetch(`${apiUrl}/auth/uploadPhotos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  }
  catch (error) {
    console.error('Error uploading photo:', error)
    throw error
  }
}

export { uploadPhoto }
