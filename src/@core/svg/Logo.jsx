const Logo = props => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
     

      <path
        d='M32 14H68L82 28V81C82 83.2 80.8 84.9 79.1 85.9L76 88L70 84L64 88L58 84L52 88L46 84L40 88L34 84L30.9 85.9C29.2 84.9 28 83.2 28 81V20C28 16.7 29.8 14 32 14Z'
        fill='currentColor'
      />

      <path d='M68 14V28H82L68 14Z' fill='white' fillOpacity='0.35' />

      <path d='M70 22L82 28V81C82 83.2 80.8 84.9 79.1 85.9L76 88L70 84V22Z' fill='black' fillOpacity='0.1' />

      <rect x='34' y='36' width='30' height='6' rx='3' fill='white' fillOpacity='0.5' />
      <rect x='34' y='49' width='32' height='4' rx='2' fill='white' fillOpacity='0.35' />
      <rect x='34' y='58' width='22' height='4' rx='2' fill='white' fillOpacity='0.3' />
      <rect x='54' y='66.5' width='16' height='6' rx='3' fill='white' fillOpacity='0.46' />
    </svg>
  )
}

export default Logo
