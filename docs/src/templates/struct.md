{{#if title}}## {{ title }}
{{/if}}

```js
{{#if name}}{{name}}: {{/if}}{
{{#each entries}}
  {{>substruct this name=@key}}
{{/each}}
}
```

{{#if definitions}}
**Definitions**

{{#each definitions}}

```js
{{>substruct this name=@key}}
```

{{/each}}
{{/if}}
