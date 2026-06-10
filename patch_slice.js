const fs = require('fs');
const file = '/var/www/app/new-front/src/store/slices/supplierAnalyticsSlice.ts';
let code = fs.readFileSync(file, 'utf8');

// Add pagination to state
code = code.replace(
  'filters: {',
  'pagination: {\n    current_page: 1,\n    last_page: 1,\n    total: 0,\n    per_page: 20,\n  },\n  filters: {'
);

code = code.replace(
  'filters: {',
  'pagination?: {\n    current_page: number;\n    last_page: number;\n    total: number;\n    per_page: number;\n  };\n  filters: {'
);

code = code.replace(
  'searchQuery: "",\n  },',
  'searchQuery: "",\n    page: 1,\n  },'
);

code = code.replace(
  'searchQuery: string;\n  };',
  'searchQuery: string;\n    page: number;\n  };'
);

code = code.replace(
  'state.stats = action.payload.stats;',
  'state.stats = action.payload.stats;\n        state.pagination = action.payload.pagination;'
);

fs.writeFileSync(file, code);
