/* eslint-disable no-undef */ /*
 * Copyright 2023 Dan Klco. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-undef */

import assert from 'assert';
import { readdirSync } from 'fs';
import { readFile } from 'fs/promises';
import { RequestLogParser } from '../src/lib/parser.js';

const parser = new RequestLogParser({
  warn: (msg) => console.warn(msg),
  debug: () => {},
});
describe('Index Tests', () => {
  describe('sample files', () => {
    readdirSync('test/samples').forEach((sample) => {
      it(`can parse sample ${sample}`, async () => {
        const lines = (
          await readFile(`${process.cwd()}/test/samples/${sample}`)
        )
          .toString('utf8')
          .split(/\n/);

        const result = parser.parse(lines);
        assert.ok(result);

        assert.ok(result.lines);
        result.lines.forEach((line) => {
          assert.ok(line.data);
          assert.ok(line.type);
        });
        assert.ok(result.requestTree);
        assert.ok(result.items);

        // const expected = JSON.parse(
        //   await readFile(`${process.cwd()}/test/expected/${sample}.json`),
        // );
        // assert.deepStrictEqual(JSON.parse(JSON.stringify(result)), expected);
      });
    });
  });

  describe('parse', () => {
    it('parses execution duration', () => {
      const lines = [
        'Request 1692759602991-181 (GET /assetdetails.html/content/dam/img_3168.jpg) by admin - RequestProgressTracker Info',
        '493897 TIMER_START{/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5}',
        '494211 LOG Adding bindings took 191 microseconds',
        '631408 TIMER_END{137508,/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5}',
      ];
      const res = parser.parse(lines);
      assert.deepStrictEqual(JSON.parse(JSON.stringify(res)), {
        totalTime: 631408,
        lines: [
          {
            data: {
              id: '1692759602991-181',
              method: 'GET',
              path: '/assetdetails.html/content/dam/img_3168.jpg',
              user: 'admin',
            },
            line: 'Request 1692759602991-181 (GET /assetdetails.html/content/dam/img_3168.jpg) by admin - RequestProgressTracker Info',
            name: '1692759602991-181 GET /assetdetails.html/content/dam/img_3168.jpg admin',
            time: 0,
            type: 'REQUEST',
          },
          {
            data: {
              time: '493897',
              item: '/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5',
            },
            duration: 137511,
            executionDuration: 137511,
            line: '493897 TIMER_START{/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5}',
            name: '/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5',
            time: 493897,
            type: 'TIMER_START',
          },
          {
            data: { time: '494211', duration: '191' },
            line: '494211 LOG Adding bindings took 191 microseconds',
            name: 'BINDINGS',
            time: 494211,
            type: 'BINDINGS',
          },
          {
            data: {
              time: '631408',
              duration: '137508',
              item: '/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5',
              detail: '',
            },
            line: '631408 TIMER_END{137508,/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5}',
            name: '/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5',
            time: 631408,
            type: 'TIMER_END',
          },
        ],
        requestTree: {
          start: {
            data: {
              id: '1692759602991-181',
              method: 'GET',
              path: '/assetdetails.html/content/dam/img_3168.jpg',
              user: 'admin',
            },
            line: 'Request 1692759602991-181 (GET /assetdetails.html/content/dam/img_3168.jpg) by admin - RequestProgressTracker Info',
            name: '1692759602991-181 GET /assetdetails.html/content/dam/img_3168.jpg admin',
            time: 0,
            type: 'REQUEST',
          },
          children: [
            {
              start: {
                data: {
                  time: '493897',
                  item: '/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5',
                },
                duration: 137511,
                executionDuration: 137511,
                line: '493897 TIMER_START{/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5}',
                name: '/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5',
                time: 493897,
                type: 'TIMER_START',
              },
              children: [
                {
                  start: {
                    data: { time: '494211', duration: '191' },
                    line: '494211 LOG Adding bindings took 191 microseconds',
                    name: 'BINDINGS',
                    time: 494211,
                    type: 'BINDINGS',
                  },
                  children: [],
                  value: 0,
                  name: 'BINDINGS',
                },
              ],
              value: 137511,
              name: '/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5',
              end: {
                data: {
                  time: '631408',
                  duration: '137508',
                  item: '/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5',
                  detail: '',
                },
                line: '631408 TIMER_END{137508,/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5}',
                name: '/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5',
                time: 631408,
                type: 'TIMER_END',
              },
            },
          ],
        },
        items: {
          'TIMER_START:/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html':
            {
              count: 1,
              executionDuration: 137511,
              instances: [
                {
                  data: {
                    time: '493897',
                    item: '/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5',
                  },
                  duration: 137511,
                  executionDuration: 137511,
                  line: '493897 TIMER_START{/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5}',
                  name: '/libs/dam/gui/coral/components/commons/ui/shell/titlehead/titlehead.html#5',
                  time: 493897,
                  type: 'TIMER_START',
                },
              ],
            },
        },
      });
    });
  });

  describe('parseLine', () => {
    it('REQUEST', () => {
      const parsed = parser.parseLine(
        'Request 1 (GET /content/personal-sites/danklco-com/index.html) by null - RequestProgressTracker Info',
      );

      assert.strictEqual(parsed.type, 'REQUEST');
      assert.strictEqual(parsed.data.id, '1');
      assert.strictEqual(
        parsed.data.path,
        '/content/personal-sites/danklco-com/index.html',
      );
      assert.strictEqual(parsed.data.method, 'GET');
      assert.strictEqual(parsed.data.user, 'null');
    });

    it('CALL_FILTER', () => {
      const parsed = parser.parseLine(
        '   9260 LOG Calling filter: org.apache.sling.i18n.impl.I18NFilter',
      );
      assert.strictEqual(parsed.type, 'CALL_FILTER');
      assert.strictEqual(
        parsed.data.item,
        'org.apache.sling.i18n.impl.I18NFilter',
      );
      assert.strictEqual(parsed.time, 9260);
    });

    it('TIMER_START', () => {
      const parsed = parser.parseLine('0 TIMER_START{Request Processing}');
      assert.strictEqual(parsed.type, 'TIMER_START');
      assert.strictEqual(parsed.time, 0);
      assert.strictEqual(parsed.data.item, 'Request Processing');
    });

    it('TIMER_END', () => {
      const parsed = parser.parseLine(
        '5736 TIMER_END{5723,handleSecurity} authenticator org.apache.sling.auth.core.impl.SlingAuthenticator@c988169b returns true',
      );
      assert.strictEqual(parsed.type, 'TIMER_END');
      assert.strictEqual(parsed.time, 5736);
      assert.strictEqual(parsed.data.item, 'handleSecurity');
      assert.strictEqual(
        parsed.data.detail,
        'authenticator org.apache.sling.auth.core.impl.SlingAuthenticator@c988169b returns true',
      );
    });

    it('FILTER_TIMING', () => {
      const parsed = parser.parseLine(
        ' 344263 LOG Filter timing: filter=org.apache.sling.cms.core.internal.filters.CMSSecurityFilter, inner=302259, total=302342, outer=83',
      );
      assert.strictEqual(parsed.type, 'FILTER_TIMING');
      assert.strictEqual(parsed.time, 344263);
      assert.strictEqual(
        parsed.data.item,
        'org.apache.sling.cms.core.internal.filters.CMSSecurityFilter',
      );
      assert.strictEqual(parsed.data.inner, '302259');
      assert.strictEqual(parsed.data.total, '302342');
      assert.strictEqual(parsed.data.outer, '83');
    });

    describe('INCLUDE_RESOURCE', () => {
      it('JcrNodeResource', () => {
        const parsed = parser.parseLine(
          "302738 LOG Including resource JcrNodeResource, type=reference/components/general/cta, superType=null, path=/content/personal-sites/danklco-com/index/jcr:content/container/columncontrol/col-0/stylewrapper/container/cta (SlingRequestPathInfo: path='/content/personal-sites/danklco-com/index/jcr:content/container/columncontrol/col-0/stylewrapper/container/cta', selectorString='null', extension='html', suffix='null')",
        );
        assert.strictEqual(parsed.type, 'INCLUDE_RESOURCE');
        assert.strictEqual(parsed.data.type, 'JcrNodeResource');
        assert.strictEqual(parsed.data.resourceSuperType, 'null');
        assert.strictEqual(
          parsed.data.item,
          '/content/personal-sites/danklco-com/index/jcr:content/container/columncontrol/col-0/stylewrapper/container/cta',
        );
        assert.strictEqual(
          parsed.data.path,
          '/content/personal-sites/danklco-com/index/jcr:content/container/columncontrol/col-0/stylewrapper/container/cta',
        );
        assert.strictEqual(parsed.data.selector, 'null');
        assert.strictEqual(parsed.data.extension, 'html');
        assert.strictEqual(parsed.data.suffix, 'null');
      });

      it('TypeOverwritingResourceWrapper', () => {
        const parsed = parser.parseLine(
          "294471 LOG Including resource TypeOverwritingResourceWrapper, type=sling-cms/components/general/container, path=/content/personal-sites/danklco-com/index/jcr:content/container/columncontrol/col-0/stylewrapper/container, resource=[JcrNodeResource, type=nt:unstructured, superType=null, path=/content/personal-sites/danklco-com/index/jcr:content/container/columncontrol/col-0/stylewrapper/container] (SlingRequestPathInfo: path='/content/personal-sites/danklco-com/index/jcr:content/container/columncontrol/col-0/stylewrapper/container', selectorString='null', extension='html', suffix='null')",
        );
        assert.strictEqual(parsed.type, 'INCLUDE_RESOURCE');
        assert.strictEqual(parsed.data.type, 'TypeOverwritingResourceWrapper');
        assert.strictEqual(
          parsed.data.resourceType,
          'sling-cms/components/general/container',
        );
        assert.strictEqual(
          parsed.data.item,
          '/content/personal-sites/danklco-com/index/jcr:content/container/columncontrol/col-0/stylewrapper/container',
        );
        assert.strictEqual(parsed.data.wrappedType, 'JcrNodeResource');
        assert.strictEqual(parsed.data.wrappedResourceType, 'nt:unstructured');
        assert.strictEqual(parsed.data.wrappedResourceSuperType, 'null');
        assert.strictEqual(
          parsed.data.wrappedPath,
          '/content/personal-sites/danklco-com/index/jcr:content/container/columncontrol/col-0/stylewrapper/container',
        );
        assert.strictEqual(parsed.data.selector, 'null');
        assert.strictEqual(parsed.data.extension, 'html');
        assert.strictEqual(parsed.data.suffix, 'null');
      });
    });

    it('REQUEST_INFO', () => {
      const parsed = parser.parseLine('      7 LOG Method=GET, PathInfo=null');
      assert.strictEqual(parsed.type, 'REQUEST_INFO');
      assert.strictEqual(parsed.time, 7);
      assert.strictEqual(parsed.data.method, 'GET');
      assert.strictEqual(parsed.data.pathInfo, 'null');
    });

    it('SLING_REQUEST_INFO', () => {
      const parsed = parser.parseLine(
        "8951 LOG Resource Path Info: SlingRequestPathInfo: path='/content/personal-sites/danklco-com/index', selectorString='null', extension='html', suffix='null'",
      );
      assert.strictEqual(parsed.type, 'SLING_REQUEST_INFO');
      assert.strictEqual(
        parsed.data.path,
        '/content/personal-sites/danklco-com/index',
      );
      assert.strictEqual(parsed.data.selector, 'null');
      assert.strictEqual(parsed.data.extension, 'html');
      assert.strictEqual(parsed.data.suffix, 'null');
    });

    describe('BINDINGS', () => {
      it('adding', () => {
        const parsed = parser.parseLine(
          '13092 LOG Adding bindings took 1578 microseconds',
          13092,
        );
        assert.deepStrictEqual(parsed, {
          type: 'BINDINGS',
          line: '13092 LOG Adding bindings took 1578 microseconds',
          time: 13092,
          name: 'BINDINGS',
          duration: undefined,
          executionDuration: undefined,
          data: { duration: '1578', time: '13092' },
        });
      });

      it('warning', () => {
        const parsed = parser.parseLine(
          '304428 LOG Adding the bindings of org.apache.sling.cms.core.internal.DefaultScriptBindingsValueProvider took 1584 microseconds which is above the hardcoded limit of 1000 microseconds; if this message appears often it indicates that this BindingsValuesProvider has an impact on general page rendering performance.',
          304428,
        );
        assert.deepStrictEqual(parsed, {
          type: 'BINDINGS',
          name: 'org.apache.sling.cms.core.internal.DefaultScriptBindingsValueProvider',
          line: '304428 LOG Adding the bindings of org.apache.sling.cms.core.internal.DefaultScriptBindingsValueProvider took 1584 microseconds which is above the hardcoded limit of 1000 microseconds; if this message appears often it indicates that this BindingsValuesProvider has an impact on general page rendering performance.',
          time: 304428,
          duration: 1584,
          executionDuration: 1584,
          data: {
            duration: '1584',
            time: '304428',
            class:
              'org.apache.sling.cms.core.internal.DefaultScriptBindingsValueProvider',
          },
        });
      });
    });

    it('INCLUDE_SCRIPT', () => {
      const parsed = parser.parseLine(
        '305061 LOG Including script footer.jsp for path=/content/personal-sites/danklco-com/index/jcr:content, type=danklco-com/components/pages/base: /apps/danklco-com/components/pages/base/footer.jsp',
      );
      assert.deepStrictEqual(
        {
          type: 'INCLUDE_SCRIPT',
          data: {
            path: '/content/personal-sites/danklco-com/index/jcr:content',
            resourceType: 'danklco-com/components/pages/base',
            scriptName: 'footer.jsp',
            scriptPath: '/apps/danklco-com/components/pages/base/footer.jsp',
            time: '305061',
          },
          duration: undefined,
          executionDuration: undefined,
          time: 305061,
          name: 'footer.jsp /content/personal-sites/danklco-com/index/jcr:content danklco-com/components/pages/base /apps/danklco-com/components/pages/base/footer.jsp',
          line: '305061 LOG Including script footer.jsp for path=/content/personal-sites/danklco-com/index/jcr:content, type=danklco-com/components/pages/base: /apps/danklco-com/components/pages/base/footer.jsp',
        },
        parsed,
      );
    });
  });

  it('will fail on invalid tree', () => {
    assert.throws(() =>
      parser.parse([
        '32654741 TIMER_END{32654740,Request Processing} Request Processing',
        '32654741 TIMER_END{32654740,Request Processing} Request Processing',
        '32654741 TIMER_END{32654740,Request Processing} Request Processing',
        '32654741 TIMER_END{32654740,Request Processing} Request Processing',
      ]),
    );
  });

  it('ignores invalid lines', () => {
    const res = parser.parse([
      'Request 1692728012118-19 (GET /assets.html/content/dam) by admin - RequestProgressTracker Info',
      '0 TIMER_START{Request Processing}',
      'NOT VALID',
    ]);
    assert(res);
  });
});
