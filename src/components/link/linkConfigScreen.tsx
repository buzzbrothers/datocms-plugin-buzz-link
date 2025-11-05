// @ts-nocheck

import { Canvas, TextareaField } from 'datocms-react-ui'
import { useCallback, useState } from 'react'
import { TLinkParameter } from './link.type.js'

export default function LinkConfigScreen({ ctx }) {
  const [formValues, setFormValues] = useState<Partial<TLinkParameter>>(
    ctx.parameters
  )
  const update = useCallback(
    (field, value) => {
      const newParameters = { ...formValues, [field]: value }
      setFormValues(newParameters)
      ctx.setParameters(newParameters)
    },
    [formValues, setFormValues, ctx.setParameters]
  )

  return (
    <Canvas ctx={ctx}>
      <TextareaField
        id="link"
        name="link"
        label="Link"
        required
        textareaInputProps={{ style: { height: '500px' } }}
        value={formValues.link}
        onChange={update.bind(null, 'link')}
      />
    </Canvas>
  )
}
