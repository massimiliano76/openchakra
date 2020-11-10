import _ from 'lodash'

import {
  loadRequired,
  splitArray,
  joinAdjacentTextNodes,
  deletePropsByComponentId,
} from '../../../utils/reducerUtilities'
import { generateComponentId, generatePropId } from '../../../utils/generateId'
import {
  addSpanForSelection,
  removeSpanForSelection,
} from '../../../utils/selectionUtility'
import { ComponentsState } from './components'
import { ISelectedTextDetails } from './components-types'

export const addSpanComponent = (
  draftState: ComponentsState,
  payload: ISelectedTextDetails,
) => {
  const { props, components, selectedId: id } = loadRequired(draftState)

  const childrenPropId =
    props.byComponentId[id].find(
      propId => props.byId[propId].name === 'children',
    ) || ''

  const newId = generateComponentId()
  const { startIndex, endIndex, startNodePosition, endNodePosition } = payload
  let start = startIndex
  let end = endIndex

  let croppedValue = ''

  //Only text node.
  if (startNodePosition === endNodePosition) {
    //  selected the text from right to left
    if (startIndex > endIndex) {
      start = endIndex
      end = startIndex
    }
    components[newId] = {
      id: newId,
      type: 'Box',
      children: [],
      parent: id,
    }

    props.byComponentId[newId] = []
    components[id].children.push(newId)

    const asPropId = generatePropId()
    props.byComponentId[newId].push(asPropId)
    props.byId[asPropId] = {
      id: asPropId,
      value: 'span',
      name: 'as',
      derivedFromComponentType: null,
      derivedFromPropName: null,
    }

    croppedValue = props.byId[childrenPropId].value[
      startNodePosition
    ].substring(start, end)

    props.byId[childrenPropId].value[startNodePosition] = splitArray({
      stringValue: props.byId[childrenPropId].value[startNodePosition],
      start,
      end,
      id: newId,
    })

    props.byId[childrenPropId].value = _.flatten(
      props.byId[childrenPropId].value,
    )

    const spanChildrenId = generatePropId()

    props.byComponentId[newId].push(spanChildrenId)
    props.byId[spanChildrenId] = {
      id: spanChildrenId,
      value: croppedValue,
      name: 'children',
      derivedFromComponentType: null,
      derivedFromPropName: null,
    }
  }
  //Combination of text node and span node.
  else {
    addSpanForSelection(childrenPropId, props, components, {
      start,
      end,
      endNodePosition,
      startNodePosition,
    })
  }
  props.byId[childrenPropId].value.filter((val: string) => val.length !== 0)
}

export const removeSpanComponent = (
  draftState: ComponentsState,
  payload: ISelectedTextDetails,
) => {
  const {
    components,
    isCustomComponentChild,
    propsId,
    selectedId: id,
  } = loadRequired(draftState)

  let props = isCustomComponentChild
    ? draftState.customComponentsProps
    : draftState.propsById[propsId]

  const { startIndex, endIndex, startNodePosition, endNodePosition } = payload

  let start = startIndex
  let end = endIndex

  //If selected the text from right to left
  if (startIndex > endIndex) {
    start = endIndex
    end = startIndex
  }

  const childrenPropId =
    props.byComponentId[id].find(
      propId => props.byId[propId].name === 'children',
    ) || ''

  props = removeSpanForSelection(childrenPropId, props, components, id, {
    start,
    end,
    startNodePosition,
    endNodePosition,
  })

  props.byId[childrenPropId].value = _.flatten(props.byId[childrenPropId].value)

  //join if there are adjacent text nodes.
  const propValue = joinAdjacentTextNodes(
    props.byId[childrenPropId],
    components,
  )
  props.byId[childrenPropId].value = propValue

  if (isCustomComponentChild) draftState.customComponentsProps = props
  else draftState.propsById[propsId] = props
}

export const clearFormatting = (draftState: ComponentsState) => {
  const {
    components,
    isCustomComponentChild,
    propsId,
    selectedId: id,
  } = loadRequired(draftState)

  let props = isCustomComponentChild
    ? draftState.customComponentsProps
    : draftState.propsById[propsId]

  const childrenPropId =
    props.byComponentId[id].find(
      propId => props.byId[propId].name === 'children',
    ) || ''

  const childrenProp = props.byId[childrenPropId]
  let newValue = ''

  if (Array.isArray(childrenProp.value)) {
    childrenProp.value.forEach((val: string) => {
      //if the value is the key for the components, then delete the component and replace it with value
      if (components[val]) {
        const spanChildrenPropId =
          props.byComponentId[val].find(
            propId => props.byId[propId].name === 'children',
          ) || ''

        newValue = newValue + props.byId[spanChildrenPropId].value
        delete components[val]

        deletePropsByComponentId(val, props)
      } else {
        newValue = newValue + val
      }
    })
  } else newValue = childrenProp.value

  props.byId[childrenPropId].value = [newValue]

  if (isCustomComponentChild) draftState.customComponentsProps = { ...props }
  else draftState.propsById[propsId] = { ...props }
}
