// @ts-nocheck
import { buildClient } from '@datocms/cma-client-browser'
import { Canvas, FieldGroup, SelectField } from 'datocms-react-ui'
import { useEffect, useState } from 'react'
import './config.css'
import { type TConfig } from './config.type'

let updateTimeout

export const MEDIA_GRID_DEFAULTS = {
  layouts: ['desktop', 'mobile'],
  columns: 6,
  rows: 6,
  allowCustomizeGrid: true
}

export default function Config({ ctx }) {
  const parameters = (ctx.plugin.attributes.parameters ?? {}) as TConfig
  const [availableModels, setAvailableModels] = useState([])

  const [linkModels, setLinkModels] = useState(parameters.linkModels ?? [])

  const [layouts, setLayouts] = useState(
    parameters.layouts ?? MEDIA_GRID_DEFAULTS.layouts
  )

  const [layoutsSettings, setLayoutsSettings] = useState(
    parameters.layoutsSettings ?? {}
  )

  useEffect(() => {
    ;(async () => {
      const client = buildClient({ apiToken: ctx.currentUserAccessToken })
      const itemTypes = await client.itemTypes.list()
      const models: any = []
      itemTypes.forEach((itemType) => {
        models.push({ label: itemType.name, value: itemType.id })
      })
      setAvailableModels(models)
    })()
  }, [])

  function updateParameters(newParameters: Partial<TConfig>): void {
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(() => {
      ctx.updatePluginParameters({
        ...parameters,
        ...newParameters
      })
      ctx.notice('Config updated successfully!')
    }, 1000)
  }

  return (
    <Canvas ctx={ctx}>
      <div className="config">
        <h2 className="typo-h3">Links</h2>
        <FieldGroup>
          <SelectField
            name="linkModels"
            id="linkModels"
            label="Link Models"
            hint="Select the models you want to be available for links"
            value={linkModels}
            selectInputProps={{
              isMulti: true,
              options: availableModels
            }}
            onChange={(newValue) => {
              setLinkModels(newValue)
              updateParameters({
                linkModels: newValue
              })
            }}
          />
        </FieldGroup>
      </div>
    </Canvas>
  )
}
