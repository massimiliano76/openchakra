import React, { memo, useState } from 'react'
import { Box, Flex, useDisclosure } from '@chakra-ui/core'
import { AiFillThunderbolt, AiOutlineFullscreen } from 'react-icons/ai'
import { buildParameters } from '../utils/codesandbox'
import { generateCode } from '../utils/code'
import useDispatch from '../hooks/useDispatch'
import { useSelector } from 'react-redux'
import {
  getComponents,
  getCustomComponents,
  getCustomComponentsList,
  getShowCustomComponentPage,
  getProps,
  getCustomComponentsProps,
} from '../core/selectors/components'
import {
  getShowLayout,
  getShowCode,
  getCustomTheme,
  getLoadedFonts,
} from '../core/selectors/app'
import HeaderMenu from './HeaderMenu'
import ClearOptionPopover from './ClearOptionPopover'
import EditThemeModal from './EditThemeModal'
import ActionButton from './inspector/ActionButton'
import { IoMdBuild, IoIosUndo, IoIosRedo } from 'react-icons/io'
import { RiCodeLine } from 'react-icons/ri'
import { MdCreateNewFolder } from 'react-icons/md'
import { ActionCreators as UndoActionCreators } from 'redux-undo'

const CodeSandboxButton = () => {
  const components = useSelector(getComponents)
  const customComponents = useSelector(getCustomComponents)
  const customComponentsList = useSelector(getCustomComponentsList)
  const props = useSelector(getProps)
  const customComponentsProps = useSelector(getCustomComponentsProps)
  const [isLoading, setIsLoading] = useState(false)
  const customTheme = useSelector(getCustomTheme)
  const fonts = useSelector(getLoadedFonts)

  const clickHandler = async () => {
    setIsLoading(true)
    const code = await generateCode(
      components,
      customComponents,
      customComponentsList,
      props,
      customComponentsProps,
      customTheme,
    )
    setIsLoading(false)
    const parameters = buildParameters(code, fonts)

    window.open(
      `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`,
      '_blank',
    )
  }

  return (
    <ActionButton
      label="Export to codesandbox"
      icon="external-link"
      onClick={clickHandler}
      isLoading={isLoading}
      size="sm"
      color="black"
    />
  )
}

const Header = () => {
  const showLayout = useSelector(getShowLayout)
  const showCode = useSelector(getShowCode)
  const showCustomPage = useSelector(getShowCustomComponentPage)
  const dispatch = useDispatch()
  const { isOpen, onClose, onOpen } = useDisclosure()

  return (
    <Flex
      justifyContent="space-between"
      as="header"
      height="3rem"
      px="1rem"
      borderBottom="1px solid rgb(225, 230, 235)"
      bg="white"
      pr={1}
      width="100%"
      alignItems="center"
    >
      <Box>
        <HeaderMenu onOpen={onOpen} />
        <EditThemeModal isOpen={isOpen} onClose={onClose} />
      </Box>
      <Flex
        width="14rem"
        height="100%"
        backgroundColor="white"
        color="white"
        as="a"
        fontSize="xl"
        flexDirection="row"
        alignItems="center"
        flex={1}
        justifyContent="center"
        ml="12%"
      >
        <Box fontSize="2xl" as={AiFillThunderbolt} mr={1} color="primary.100" />{' '}
        <Box fontWeight="bold" color="black">
          Assembler
        </Box>
      </Flex>

      <Flex>
        <Flex border="1px solid #9FB3C8" mr={4} alignItems="center">
          <Box borderRight="1px solid #9FB3C8">
            <ActionButton
              label="Create components"
              icon={MdCreateNewFolder}
              onClick={() => {
                dispatch.components.unselect()
                if (showCustomPage) dispatch.components.switchPage('app')
                else dispatch.components.switchPage('customPage')
              }}
              bg={showCustomPage ? 'primary.100' : 'white'}
              color={showCustomPage ? 'primary.900' : 'black'}
              size="sm"
            />
          </Box>
          <Box borderRight="1px solid #9FB3C8">
            <ActionButton
              label="Code"
              icon={RiCodeLine}
              onClick={() => dispatch.app.toggleCodePanel()}
              bg={showCode ? 'primary.100' : 'white'}
              color={showCode ? 'primary.900' : 'black'}
              size="sm"
            />
          </Box>

          <Box>
            <ActionButton
              label="Builder Mode"
              icon={IoMdBuild}
              onClick={() => dispatch.app.toggleBuilderMode()}
              bg={showLayout ? 'primary.100' : 'white'}
              color={showLayout ? 'primary.900' : 'black'}
              size="sm"
              isDisabled={showCode}
            />
          </Box>
        </Flex>
        <Flex border="1px solid #9FB3C8" mr={2} alignItems="center">
          <Box borderRight="1px solid #9FB3C8">
            <ActionButton
              label="fullScreen"
              icon={AiOutlineFullscreen}
              onClick={() => dispatch.app.toggleFullScreen()}
              color="black"
              size="sm"
            />
          </Box>
          <Box borderRight="1px solid #9FB3C8">
            <ActionButton
              label="Undo"
              icon={IoIosUndo}
              onClick={() => dispatch(UndoActionCreators.undo())}
              size="sm"
            />
          </Box>
          <Box borderRight="1px solid #9FB3C8">
            <ActionButton
              label="Redo"
              icon={IoIosRedo}
              onClick={() => dispatch(UndoActionCreators.redo())}
              size="sm"
            />
          </Box>

          <Box borderRight="1px solid #9FB3C8">
            <CodeSandboxButton />
          </Box>

          <Box>
            <ClearOptionPopover
              name="Clear Page"
              message="Do you really want to remove all components on the page?"
              dispatchAction={() => dispatch.components.resetComponents()}
            />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default memo(Header)
