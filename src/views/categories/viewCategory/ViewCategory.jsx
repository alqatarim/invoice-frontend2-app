'use client'

import React from 'react'
import Category from '@/views/categories/category'

const ViewCategory = ({ controller }) => {
  return (
    <Category
      controller={controller}
      title='View Category'
      closeLabel='Close'
    />
  )
}

export default ViewCategory
