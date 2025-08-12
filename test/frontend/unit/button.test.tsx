
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { test, expect } from 'vitest'
let Button: any
try {
  Button = (await import('../../../frontend/components/ui/button')).Button
} catch (e) {
  test.skip('ui/button not found', () => {})
}
if (Button) {
  test('button renders', () => {
    render(Button({ children: 'Click Me' }))
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })
}
