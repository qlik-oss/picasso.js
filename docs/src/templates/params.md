({{~#each this~}}
  {{~#if optional}}[{{/if~}}
  {{name}}{{#typedef this}} *:{{this}}*{{/typedef}}
  {{~#unless @last}}, {{/unless~}}
  {{~#if optional}}]{{/if~}}
{{~/each~}})