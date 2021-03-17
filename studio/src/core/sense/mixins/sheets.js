const sheetListProps = {
  qInfo: {
    qId: 'SheetList',
    qType: 'SheetList',
  },
  qAppObjectListDef: {
    qType: 'sheet',
    qData: {
      title: '/qMetaDef/title',
      labelExpression: '/labelExpression',
      showCondition: '/showCondition',
      description: '/qMetaDef/description',
      descriptionExpression: '/descriptionExpression',
      thumbnail: '/thumbnail',
      cells: '/cells',
      rank: '/rank',
      columns: '/columns',
      rows: '/rows',
    },
  },
};

const mixin = {
  types: 'Doc',

  extend: {
    getSheetList() {
      return this.getListData(sheetListProps);
    },

    getSheetListObject() {
      return this.getListObject(sheetListProps);
    },
  },
};
export { mixin, sheetListProps };
