import React from 'react'
import Category from '@/views/categories/category'

const AddCategory = ({ controller }) => {
  return (
    <Category
      controller={controller}
      title='Add New Category'
      submitLabel='Add Category'
      submittingLabel='Adding...'
    />
  )
}

export default AddCategory
