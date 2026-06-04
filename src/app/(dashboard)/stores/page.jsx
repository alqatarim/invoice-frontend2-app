import React from 'react'
import BranchListIndex from '@/views/branches/branchList/index'
import {
  getActiveUsersForBranchAssignment,
  getInitialBranchData,
  getProvincesCities,
} from '@/app/(dashboard)/branches/actions'

export const metadata = {
  title: 'Stores | Kanakku',
}

const StoresPage = async ({ searchParams }) => {
  const initialFilters = {
    province: searchParams?.province || '',
    city: searchParams?.city || '',
  };

  try {
    const [initialBranchDataResult, provincesCitiesResult, initialUsersResult] =
      await Promise.allSettled([
        getInitialBranchData(initialFilters),
        getProvincesCities(),
        getActiveUsersForBranchAssignment(),
      ])

    if (initialBranchDataResult.status !== 'fulfilled') {
      throw initialBranchDataResult.reason
    }

    const provincesCities =
      provincesCitiesResult.status === 'fulfilled' ? provincesCitiesResult.value : []
    const initialBranchData = initialBranchDataResult.value || {}
    const initialUsers =
      initialUsersResult.status === 'fulfilled' ? initialUsersResult.value || [] : []

    return (
      <BranchListIndex
        initialBranches={initialBranchData.branches || []}
        initialPagination={initialBranchData.pagination || { current: 1, pageSize: 10, total: 0 }}
        initialSummary={initialBranchData.summary || {}}
        initialProvincesCities={provincesCities}
        initialUsers={initialUsers}
        initialFilters={initialFilters}
      />
    )
  } catch (error) {
    console.error('StoresPage: Error fetching data:', error)
    return (
      <div className='text-red-600 p-8'>
        Failed to load stores: {error.message}
      </div>
    )
  }
}

export default StoresPage
