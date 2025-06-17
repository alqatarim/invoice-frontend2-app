import { useState, useCallback, useRef } from 'react'
import { debounce } from '@/utils/debounce'

/**
 * Search handler for managing customer list search functionality
 */
export const useSearchHandler = ({
  fetchCustomers,
  handleSearchChange,
  onError
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const searchTimeoutRef = useRef(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      setSearching(true)
      try {
        // Update filter and fetch customers
        handleSearchChange(term)
        await fetchCustomers({ search: term, page: 1 })
      } catch (error) {
        console.error('Error searching customers:', error)
        onError(error.message || 'Search failed')
      } finally {
        setSearching(false)
      }
    }, 300),
    [fetchCustomers, handleSearchChange, onError]
  )

  // Handle search input change
  const handleSearchInputChange = useCallback((event) => {
    const value = event.target.value
    setSearchTerm(value)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Debounce search
    debouncedSearch(value)
  }, [debouncedSearch])

  // Handle search submit
  const handleSearchSubmit = useCallback(async (event) => {
    event.preventDefault()
    setSearching(true)

    try {
      handleSearchChange(searchTerm)
      await fetchCustomers({ search: searchTerm, page: 1 })
    } catch (error) {
      console.error('Error submitting search:', error)
      onError(error.message || 'Search failed')
    } finally {
      setSearching(false)
    }
  }, [searchTerm, fetchCustomers, handleSearchChange, onError])

  // Clear search
  const handleSearchClear = useCallback(async () => {
    setSearchTerm('')
    setSearching(true)

    try {
      handleSearchChange('')
      await fetchCustomers({ search: '', page: 1 })
    } catch (error) {
      console.error('Error clearing search:', error)
      onError(error.message || 'Failed to clear search')
    } finally {
      setSearching(false)
    }
  }, [fetchCustomers, handleSearchChange, onError])

  // Handle search focus
  const handleSearchFocus = useCallback(() => {
    // Additional focus logic if needed
  }, [])

  // Handle search blur
  const handleSearchBlur = useCallback(() => {
    // Additional blur logic if needed
  }, [])

  return {
    // State
    searchTerm,
    searching,

    // Actions
    handleSearchInputChange,
    handleSearchSubmit,
    handleSearchClear,
    handleSearchFocus,
    handleSearchBlur,
    setSearchTerm
  }
}