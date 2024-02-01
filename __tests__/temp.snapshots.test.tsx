import { render } from '@testing-library/react'
import Home from '@/app/temp/home'
 
it('renders homepage unchanged', () => {
  const { container } = render(<Home />)
  expect(container).toMatchSnapshot()
})