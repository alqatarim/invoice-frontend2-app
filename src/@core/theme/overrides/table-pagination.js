const tablePagination = {
  MuiTablePagination: {
    styleOverrides: {
      toolbar: ({ theme }) => ({
        paddingInlineEnd: `${theme.spacing(3)} !important`,
        [theme.breakpoints.down('sm')]: {
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: theme.spacing(1),
          paddingInline: `${theme.spacing(2)} !important`,
        },
      }),
      select: ({ theme }) => ({
        ...theme.typography.body1,
        paddingInlineStart: 0,
        '& ~ i, & ~ svg': {
          fontSize: 20,
          right: '2px !important',
          color: 'var(--mui-palette-action-active)'
        }
      }),
      selectLabel: ({ theme }) => ({
        ...theme.typography.body1,
        color: 'var(--mui-palette-text-secondary)'
      }),
      input: ({ theme }) => ({
        marginInlineEnd: theme.spacing(6),
        [theme.breakpoints.down('sm')]: {
          marginInlineEnd: theme.spacing(2),
        },
      }),
      displayedRows: ({ theme }) => ({
        ...theme.typography.body1
      }),
      actions: ({ theme }) => ({
        marginInlineStart: theme.spacing(6),
        [theme.breakpoints.down('sm')]: {
          marginInlineStart: 0,
        },
        '& .Mui-disabled': {
          color: 'var(--mui-palette-action-active)'
        },
        '& .MuiIconButton-root:last-of-type': {
          marginInlineStart: theme.spacing(2)
        }
      })
    }
  }
}

export default tablePagination
