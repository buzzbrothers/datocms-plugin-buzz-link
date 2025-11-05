// @ts-nocheck

import { capitalCase } from '@blackbyte/sugar/string'
import { buildClient } from '@datocms/cma-client-browser'
import {
  Canvas,
  SelectField,
  Spinner,
  SwitchField,
  TextField
} from 'datocms-react-ui'
import get from 'lodash/get'
import { useEffect, useRef, useState } from 'react'
import { getStatusLabel } from '../../utils/statusUtils'
import './link.css'
import { TLink } from './link.type'

export default function LinkField({ ctx }) {
  const currentValueRaw = get(ctx.formValues, ctx.fieldPath) ?? '{}',
    link = JSON.parse(currentValueRaw) as TLink

  const locale = ctx.locale || 'en'

  const isMounted = useRef(false)

  const pluginName = ctx.plugin.attributes?.parameters?.pluginName,
    apiToken = ctx.currentUserAccessToken,
    linkModels = ctx.plugin.attributes?.parameters?.linkModels ?? []

  const [record, setRecord] = useState(null)
  const [recordId, setRecordId] = useState(link.recordId)
  const [recordType, setRecordType] = useState(link.recordType)
  const [url, setUrl] = useState(link.url)
  const [href, setHref] = useState(link.href)
  const [text, setText] = useState(link.text)
  const [title, setTitle] = useState(link.title)
  const [id, setId] = useState(link.id)
  const [newWindow, setNewWindow] = useState(link.target === '_blank')
  const [previewUrl, setPreviewUrl] = useState('')
  const [itemTypeName, setItemTypeName] = useState(link.itemTypeName)
  const [itemTypeKey, setItemTypeKey] = useState(link.itemTypeKey)
  const [status, setStatus] = useState(link.status)
  const [loading, setLoading] = useState(false)

  // const validate = () => {
  //     if (!link.text) {
  //         ctx.setFieldValue(ctx.fieldPath, null);
  //     }
  //     console.log('link', link)
  // }

  const client = buildClient({ apiToken, environment: ctx.environment })
  const setParameterValue = (parameterId: string, newValue: any) => {
    if (link[parameterId] === newValue) {
      return
    }
    // set then new value
    link[parameterId] = newValue
    ctx.setFieldValue(ctx.fieldPath, JSON.stringify(link))
    // validate()
  }

  const getRecordOfType = async (modelId: string) => {
    let record = null
    record = await ctx.selectItem(modelId, {
      multiple: false,
      initialLocationQuery: {
        locale: locale
      }
    })
    return record
  }

  // when the record id changes, get the record
  useEffect(() => {
    if (!recordId) {
      return
    }

    ;(async () => {
      setLoading(true)
      const record = await client.items.find(recordId, {
        locale
      })
      if (!record) {
        return
      }

      let titleField = 'title'
      let imagePreviewField = null
      let imageUrl = null
      let itemTypeNameStr = ''
      let itemTypeKey = ''

      if (record['item_type']) {
        const itemType = await client.itemTypes.find(record.item_type.id)
        itemTypeNameStr = itemType.name
        itemTypeKey = itemType.api_key

        // getting the title_field setup
        const tf = await client.fields.find(itemType.title_field.id)
        titleField = tf.api_key

        // getting the image_preview_field setup
        const ipf = await client.fields.find(itemType.image_preview_field?.id)
        imagePreviewField = ipf.api_key
      }

      if (imagePreviewField) {
        const upload = await client.uploads.find(
          record[imagePreviewField].upload_id
        )
        imageUrl = `${upload.url}?auto=format&w=120&h=120&fit=crop`

        if (upload.default_field_metadata?.focal_point?.[locale]) {
          let fp = `&fp-x=${
            upload.default_field_metadata?.focal_point?.[locale].x
          }&fp-y=${upload.default_field_metadata?.focal_point?.[ctx.locale].y}`
          imageUrl += fp
        }
        setPreviewUrl(imageUrl)
      }

      let finalUrl = record.slug[locale] ?? ''
      if (!finalUrl.match(/^https?:\/\//) && !finalUrl.startsWith('/')) {
        finalUrl = `/${finalUrl}`
      }

      // set the record values
      setTitle(record[titleField][locale])
      setUrl(finalUrl)
      setHref(finalUrl)
      setStatus(record.meta.status)
      setItemTypeName(itemTypeNameStr)

      // set values in final json
      setParameterValue('title', record[titleField][locale])
      setParameterValue('recordId', record.id)
      setParameterValue('url', finalUrl)
      setParameterValue('href', finalUrl)

      // if dont have any text yet, set it using the title
      if (!text) {
        setText(record[titleField][locale])
        setParameterValue('text', record[titleField][locale])
      }

      // Process type by removing spaces and special characters
      let type = capitalCase(itemTypeKey).replace(/\s/g, '')
      if (!type.endsWith('Record')) {
        type += 'Record'
      }
      setItemTypeKey(type)
      setParameterValue('type', type)

      // reset loading
      setLoading(false)
    })()
  }, [recordId])

  function resetRecord(): void {
    setRecordId(null)
    setTitle(null)
    setUrl(null)
    setHref(null)
    // setText(null);
    setStatus(null)
    setItemTypeName(null)
    setParameterValue('recordId', null)
    setParameterValue('title', null)
    setParameterValue('url', null)
    setParameterValue('text', null)
    setParameterValue('type', null)
  }

  return (
    <Canvas ctx={ctx}>
      <div className="link-field">
        <div className="link-field_text">
          <TextField
            name="text"
            id="text"
            required
            placeholder="Link text..."
            value={text ?? ''}
            onChange={(value) => {
              setText(value)
              setParameterValue('text', value)
            }}
          />
        </div>

        {recordId && (
          <div
            className="link-field_record"
            onClick={() => {
              ctx.editItem(recordId)
            }}
          >
            {loading ? (
              <div className="link-field_record-loading">
                <Spinner size={24} />
              </div>
            ) : (
              <>
                <button
                  className="link-field_record-remove remove-button"
                  onClick={(event) => {
                    // reset the record
                    event.preventDefault()
                    event.stopPropagation()
                    resetRecord()
                  }}
                ></button>
                <img
                  className="link-field_record-image"
                  src={`${previewUrl}`}
                  alt="Preview image"
                />
                <div className="link-field_record-info">
                  <p className="link-field_record-type">{itemTypeName}</p>
                  <h5 className="link-field_record-title">{title}</h5>
                  <p className={`link-field_record-status -${status}`}>
                    {getStatusLabel(status)}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        {!recordId && (
          <div className="link-field_container">
            {apiToken && linkModels && (
              <>
                <SelectField
                  name="models"
                  id="models"
                  placeholder="Select a content"
                  selectInputProps={{
                    isMulti: false,
                    options: [...linkModels]
                  }}
                  onChange={async (newValue) => {
                    // open the content selector
                    const record = await getRecordOfType(newValue.value)
                    if (record) {
                      setRecord(record)
                      setRecordId(record.id)
                    }
                  }}
                />
                <div className="link-field_separator">or</div>
              </>
            )}
            <div className="link-field_url">
              <TextField
                name="url"
                id="url"
                placeholder="External URL..."
                value={url ?? ''}
                onChange={(value) => {
                  setUrl(value)
                  setHref(value)
                  setParameterValue('url', value)
                  setParameterValue('href', value)
                }}
              />
            </div>
          </div>
        )}

        <div className="link-field_options">
          <TextField
            name="id"
            id="id"
            placeholder="Optional id for SEO..."
            value={id ?? ''}
            onChange={(value) => {
              setId(value)
              setParameterValue('id', value)
            }}
          />
          <div className="link-field_option-target">
            <SwitchField
              name="target"
              id="target"
              label="New window"
              value={newWindow}
              onChange={(newValue) => {
                setNewWindow(newValue)
                setParameterValue('target', newValue ? '_blank' : '_self')
              }}
            />
          </div>
        </div>
      </div>
    </Canvas>
  )
}
