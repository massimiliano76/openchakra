import { useRef, MouseEvent, useState } from 'react'
import { useSelector } from 'react-redux'
import useDispatch from './useDispatch'
import { useDrag } from 'react-dnd'
import {
  getIsSelectedComponent,
  getShowCustomComponentPage,
  isChildrenOfCustomComponent,
  getPropsBy,
  isImmediateChildOfCustomComponent,
  getIsHovered,
} from '../core/selectors/components'
import { getShowLayout, getFocusedComponent } from '../core/selectors/app'
import { generateId } from '../utils/generateId'
import { useHoverComponent } from './useHoverComponent'
import useCustomTheme from './useCustomTheme'

export const useInteractive = (
  component: IComponent,
  enableVisualHelper: boolean = false,
  isCustomComponent?: boolean,
  onlyVisualHelper?: boolean,
) => {
  const dispatch = useDispatch()
  const showLayout = useSelector(getShowLayout)
  const isComponentSelected = useSelector(getIsSelectedComponent(component.id))
  const isElementOnInspectorHovered = useSelector(getIsHovered(component.id))
  const [isHovered, setIsHovered] = useState(false)
  const focusInput = useSelector(getFocusedComponent(component.id))
  const isCustomComponentPage = useSelector(getShowCustomComponentPage)
  const isCustomComponentChild = useSelector(
    isChildrenOfCustomComponent(component.id),
  )
  const isImmediateChild = useSelector(
    isImmediateChildOfCustomComponent(component),
  )
  const fetchedProps = useSelector(getPropsBy(component.id))
  const enableInteractive = isCustomComponentPage || !isCustomComponentChild
  const componentProps = onlyVisualHelper ? [] : [...fetchedProps]
  const theme = useCustomTheme()

  //every custom component type is changed to custom type because only that type will be accepted in the drop.
  const [, drag] = useDrag({
    item: {
      id: component.id,
      type: isCustomComponent ? 'Custom' : component.type,
      isMoved: true,
    },
  })

  const ref = useRef<HTMLDivElement>(null)

  const boundingPosition =
    ref.current !== null ? ref.current.getBoundingClientRect() : undefined
  const { hover } = useHoverComponent(
    component.id,
    boundingPosition && {
      top: boundingPosition.top,
      bottom: boundingPosition.bottom,
    },
  )

  let props = enableInteractive
    ? [
        {
          id: generateId(),
          name: 'onMouseOver',
          value: (event: MouseEvent) => {
            event.stopPropagation()
            setIsHovered(true)
          },
          componentId: component.id,
          derivedFromComponentType: null,
          derivedFromPropName: null,
        },
        {
          id: generateId(),
          name: 'onMouseOut',
          value: () => {
            setIsHovered(false)
          },
          componentId: component.id,
          derivedFromComponentType: null,
          derivedFromPropName: null,
        },
        {
          id: generateId(),
          name: 'onClick',
          value: (event: MouseEvent) => {
            event.preventDefault()
            event.stopPropagation()
            dispatch.components.select(component.id)
          },
          componentId: component.id,
          derivedFromComponentType: null,
          derivedFromPropName: null,
        },
        {
          id: generateId(),
          name: 'onDoubleClick',
          value: (event: MouseEvent) => {
            event.preventDefault()
            event.stopPropagation()
            if (focusInput === false) {
              dispatch.app.toggleInputText()
            }
          },
          componentId: component.id,
          derivedFromComponentType: null,
          derivedFromPropName: null,
        },
        {
          id: generateId(),
          name: 'fontFamily',
          value:
            component.type === 'Heading'
              ? theme.fonts.heading
              : theme.fonts.body,
          componentId: component.id,
          derivedFromComponentType: null,
          derivedFromPropName: null,
        },
        ...componentProps,
      ]
    : [...componentProps]

  if (showLayout && enableVisualHelper) {
    props = [
      {
        id: generateId(),
        name: 'border',
        value: `1px dashed #718096`,
        componentId: component.id,
        derivedFromComponentType: null,
        derivedFromPropName: null,
      },
      {
        id: generateId(),
        name: 'padding',
        value: '1rem',
        componentId: component.id,
        derivedFromComponentType: null,
        derivedFromPropName: null,
      },
      ...props,
    ]
  }

  //If it is a immediate child of custom component, its width should be 100%.
  if (isImmediateChild) {
    props = [
      ...props,
      {
        id: generateId(),
        name: 'width',
        value: '100%',
        componentId: component.id,
        derivedFromComponentType: null,
        derivedFromPropName: null,
      },
    ]
  }

  if (isHovered || isComponentSelected || isElementOnInspectorHovered) {
    props = [
      ...props,
      {
        id: generateId(),
        name: 'boxShadow',
        value: `${focusInput ? '#ffc4c7' : '#4FD1C5'} 0px 0px 0px 2px`,
        componentId: component.id,
        derivedFromComponentType: null,
        derivedFromPropName: null,
      },
    ]
  }
  return {
    props,
    ref: enableInteractive ? drag(hover(ref)) : ref,
    drag,
  }
}
