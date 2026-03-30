'use client'

import React from 'react'
import Category from '@/views/categories/category'

const ViewCategory = ({ controller, onEdit }) => {
  return (
    <Category
      controller={controller}
      title='View Category'
      closeLabel='Close'
      onEdit={onEdit}
    />
  )
}

export default ViewCategory
