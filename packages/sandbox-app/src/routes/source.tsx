import {createElement, Fragment, useEffect, useState} from 'react'
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import { ReactElement } from 'rehype-react/lib'

import compile, { type CompileOptions } from '@lightsim/compiler'

const text = `<h2>Hello, world!</h2>
<p>Welcome to my page 👀</p>`

const compileOptions: CompileOptions = {
	render: { format: 'md' },
	singlePage: true,
};

function useProcessor(text: string) {
  const [Content, setContent] = useState(Fragment as unknown as ReactElement)

  useEffect(() => {
    unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeReact, {createElement, Fragment})
      .process(text)
      .then((file) => {
        setContent(file.result)
      })
  }, [text])

  return Content
}

export default function Source() {
  return useProcessor(text)
}