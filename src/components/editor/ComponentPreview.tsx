import React, { memo } from 'react'
import { useSelector } from 'react-redux'

import AlertPreview from './previews/AlertPreview'
import AvatarPreview, {
  AvatarBadgePreview,
  AvatarGroupPreview,
} from './previews/AvatarPreview'
import AccordionPreview, {
  AccordionHeaderPreview,
  AccordionItemPreview,
  AccordionPanelPreview,
} from './previews/AccordionPreview'
import * as Chakra from '@chakra-ui/core'
import WithChildrenPreviewContainer from './WithChildrenPreviewContainer'
import { getComponentBy } from '../../core/selectors/components'
import PreviewContainer from './PreviewContainer'
import { InputRightElementPreview } from './previews/InputRightElement'
import { InputLeftElementPreview } from './previews/InputLeftElement'
import AspectRatioBoxPreview from './previews/AspectRatioBoxPreview'
import MenuPreview, {
  MenuListPreview,
  MenuButtonPreview,
  MenuGroupPreview,
  MenuItemPreview,
} from './previews/MenuPreview'
import CustomComponentPreview from './previews/CustomComponentPreview'

const ComponentPreview: React.FC<{
  componentName: string
  customProps?: any
}> = ({ componentName, customProps, ...forwardedProps }) => {
  const component = useSelector(getComponentBy(componentName))
  if (!component) {
    console.error(`ComponentPreview unavailable for component ${componentName}`)
  }
  const type = (component && component.type) || null
  switch (type) {
    // Simple components
    case 'Badge':
    case 'Button':
    case 'IconButton':
    case 'Image':
    case 'Text':
    case 'Link':
    case 'Spinner':
    case 'Checkbox':
    case 'Textarea':
    case 'CircularProgress':
    case 'Heading':
    case 'Switch':
    case 'FormLabel':
    case 'FormHelperText':
    case 'FormErrorMessage':
    case 'TabPanel':
    case 'Tab':
    case 'Input':
    case 'Radio':
    case 'ListItem':
    case 'NumberInput':
    case 'BreadcrumbLink':
    case 'Select':
      return (
        <PreviewContainer
          component={component}
          type={Chakra[type]}
          customProps={customProps}
          {...forwardedProps}
        />
      )
    // Wrapped functional components (forward ref issue)
    case 'AlertIcon':
    case 'Progress':
    case 'CloseButton':
    case 'AccordionIcon':
    case 'Code':
    case 'Icon':
    case 'ListIcon':
    case 'Divider':
    case 'AlertDescription':
    case 'AlertTitle':
    case 'InputRightAddon':
    case 'InputLeftAddon':
    case 'Tag':
    case 'MenuDivider':
    case 'MenuItemOption':
      return (
        <PreviewContainer
          component={component}
          type={Chakra[type]}
          {...forwardedProps}
          customProps={customProps}
          isBoxWrapped
        />
      )
    // Components with childrens
    case 'Box':
    case 'SimpleGrid':
    case 'Flex':
    case 'FormControl':
    case 'Tabs':
    case 'List':
    case 'TabList':
    case 'TabPanels':
    case 'Grid':
      return (
        <WithChildrenPreviewContainer
          enableVisualHelper
          component={component}
          type={Chakra[type]}
          customProps={customProps}
          {...forwardedProps}
        />
      )
    case 'RadioGroup':
    case 'Stack':
    case 'Breadcrumb':
    case 'InputGroup':
    case 'BreadcrumbItem':
    case 'MenuOptionGroup':
      return (
        <WithChildrenPreviewContainer
          enableVisualHelper
          component={component}
          type={Chakra[type]}
          customProps={customProps}
          {...forwardedProps}
          isBoxWrapped
        />
      )
    // More complex components
    case 'InputRightElement':
      return (
        <InputRightElementPreview
          component={component}
          customProps={customProps}
        />
      )
    case 'InputLeftElement':
      return (
        <InputLeftElementPreview
          component={component}
          customProps={customProps}
        />
      )
    case 'Avatar':
      return <AvatarPreview component={component} customProps={customProps} />
    case 'AvatarBadge':
      return (
        <AvatarBadgePreview component={component} customProps={customProps} />
      )
    case 'AvatarGroup':
      return (
        <AvatarGroupPreview component={component} customProps={customProps} />
      )
    case 'Alert':
      return <AlertPreview component={component} />
    case 'Accordion':
      return <AccordionPreview component={component} />
    case 'AccordionHeader':
      return <AccordionHeaderPreview component={component} />
    case 'AccordionItem':
      return <AccordionItemPreview component={component} />
    case 'AccordionPanel':
      return <AccordionPanelPreview component={component} />
    case 'AspectRatioBox':
      return <AspectRatioBoxPreview component={component} />
    case 'Menu':
      return <MenuPreview component={component} />
    case 'MenuList':
      return <MenuListPreview component={component} />
    case 'MenuButton':
      return <MenuButtonPreview component={component} />
    case 'MenuItem':
      return <MenuItemPreview component={component} />
    case 'MenuGroup':
      return <MenuGroupPreview component={component} />
    default:
      return (
        <CustomComponentPreview
          component={component}
          customProps={customProps}
        />
      )
  }
}

export default memo(ComponentPreview)
