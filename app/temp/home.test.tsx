import Home from './home'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
 
describe('Home', () => {

  it('renders a headin 1', () => {
    render(<Home />)
 
    const heading = screen.getByRole('heading', { level: 1 })
 
    expect(heading).toBeInTheDocument()
  })

  it('renders a heading 3', () => {
    render(<Home />)
 
    const heading = screen.getByRole('heading', { level: 3 })
 
    expect(heading).toBeInTheDocument()
  })
})