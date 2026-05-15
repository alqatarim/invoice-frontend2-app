'use client'

import React from 'react'
import Category from '@/views/categories/category'

const EditCategory = ({ controller }) => {
  return (
    <Category
      controller={controller}
      title='Edit Category'
      submitLabel='Update'
    />
  )
}

export default EditCategory
