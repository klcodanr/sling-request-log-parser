/*
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
/* eslint-disable no-useless-escape */
/* eslint-disable class-methods-use-this */
/* eslint no-param-reassign: ["error", { "props": false }] */

const PATTERNS = [
  {
    pattern: /(\d+) TIMER_END.*Dumping SlingRequestProgressTracker Entries$/,
    fields: ['time'],
    idFields: [],
    type: 'DUMPING_ENTRIES',
    includeDuration: false,
  },
  {
    pattern:
      /^Request ([\d-]*) \((\w{3,5}) (.+)\) by (.+) - RequestProgressTracker Info$/,
    fields: ['id', 'method', 'path', 'user'],
    idFields: ['id', 'method', 'path', 'user'],
    type: 'REQUEST',
    includeDuration: false,
  },
  {
    pattern: /^(\d+) LOG Calling filter: ([\w\.]+)$/,
    fields: ['time', 'item'],
    idFields: ['item'],
    type: 'CALL_FILTER',
    includeDuration: true,
  },
  {
    pattern:
      /^(\d+) LOG Filter timing: filter=([\w.]+), inner=(\d+), total=(\d+), outer=(\d+)$/,
    fields: ['time', 'item', 'inner', 'total', 'outer'],
    idFields: ['item'],
    type: 'FILTER_TIMING',
    includeDuration: false,
  },
  {
    pattern: /^(\d+) TIMER_START{(.+)}$/,
    fields: ['time', 'item'],
    idFields: ['item'],
    type: 'TIMER_START',
    includeDuration: true,
  },
  {
    pattern: /^(\d+) TIMER_END{(\d*),(.+)}\s*(.*)s*$/,
    fields: ['time', 'duration', 'item', 'detail'],
    idFields: ['item'],
    type: 'TIMER_END',
    includeDuration: false,
  },
  {
    pattern:
      /^(\d+) LOG Including resource (TypeOverwritingResourceWrapper), type=(.+), path=(.+), resource=\[(\w+), type=(.+), superType=(.+), path=(.+)\] \(SlingRequestPathInfo: path='(.+)', selectorString='(.+)', extension='(.+)', suffix='(.+)'\)$/,
    fields: [
      'time',
      'type',
      'resourceType',
      'item',
      'wrappedType',
      'wrappedResourceType',
      'wrappedResourceSuperType',
      'wrappedPath',
      'path',
      'selector',
      'extension',
      'suffix',
    ],
    idFields: ['item'],
    type: 'INCLUDE_RESOURCE',
    includeDuration: true,
  },
  {
    pattern:
      /^(\d+) LOG Including resource (\w+), type=(.+), superType=(.+), path=(.+) \(SlingRequestPathInfo: path='(.+)', selectorString='(.+)', extension='(.+)', suffix='(.+)'\)$/,
    fields: [
      'time',
      'type',
      'resourceType',
      'resourceSuperType',
      'item',
      'path',
      'selector',
      'extension',
      'suffix',
    ],
    idFields: ['item'],
    type: 'INCLUDE_RESOURCE',
    includeDuration: true,
  },
  {
    pattern:
      /^(\d+) LOG Including resource (\w+), type=(.+), path=(.+) \(SlingRequestPathInfo: path='(.+)', selectorString='(.+)', extension='(.+)', suffix='(.+)'\)$/,
    fields: [
      'time',
      'type',
      'resourceType',
      'item',
      'path',
      'selector',
      'extension',
      'suffix',
    ],
    idFields: ['item'],
    type: 'INCLUDE_RESOURCE',
    includeDuration: true,
  },
  {
    pattern: /^(\d+) LOG Method=(\w+), PathInfo=(.+)$/,
    fields: ['time', 'method', 'pathInfo'],
    idFields: ['method', 'pathInfo'],
    type: 'REQUEST_INFO',
    includeDuration: false,
  },
  {
    pattern:
      /^(\d+) LOG Resource Path Info: SlingRequestPathInfo: path='(.+)', selectorString='(.+)', extension='(.+)', suffix='(.+)'$/,
    fields: ['time', 'path', 'selector', 'extension', 'suffix'],
    idFields: ['path', 'selector', 'extension', 'suffix'],
    type: 'SLING_REQUEST_INFO',
    includeDuration: true,
  },
  {
    pattern: /^(\d+) LOG Adding bindings took (\d*) microseconds$/,
    fields: ['time', 'duration'],
    idFields: [],
    type: 'BINDINGS',
    includeDuration: false,
  },
  {
    pattern:
      /^(\d+) LOG Adding the bindings of (.+) took (\d+) microseconds.+$/,
    fields: ['time', 'class', 'duration'],
    idFields: ['class'],
    type: 'BINDINGS',
    includeDuration: false,
  },
  {
    pattern: /^(\d+) LOG Including script (.+) for path=(.+), type=(.+): (.+)$/,
    fields: ['time', 'scriptName', 'path', 'resourceType', 'scriptPath'],
    idFields: ['scriptName', 'path', 'resourceType', 'scriptPath'],
    type: 'INCLUDE_SCRIPT',
    includeDuration: true,
  },
  {
    pattern: /^(\d+) LOG (.+)$/,
    fields: ['time', 'message'],
    idFields: ['message'],
    type: 'LOG',
    includeDuration: false,
  },
  {
    pattern: /^(\d)+ COMMENT (.+)$/,
    fields: ['time', 'message'],
    idFields: ['message'],
    type: 'LOG',
    includeDuration: false,
  },
];

/**
 * @typedef ParsedLine
 * @property {Record<string,number|string>} data
 * @property {number} [duration]
 * @property {number} [executionDuration]
 * @property {string} line
 * @property {number} time
 * @property {string} type
 * @property {string} [name]
 * @property {number} [value]
 */

/**
 * @typedef RequestTreeItem
 * @property {ParsedLine} start
 * @property {ParsedLine} [end]
 * @property {Array<RequestTreeItem>} children
 */

export class RequestLogParser {
  #log;

  constructor(log) {
    this.#log = log || console;
  }

  /**
   * Calculates the actual execution time for the specified line
   * @param {RequestTreeItem} requestItem
   */
  #calculateExecutionTime(requestItem) {
    if (requestItem.start.duration) {
      const childDuration = requestItem.children
        .filter((c) => c.start.duration)

        .reduce((prev, child) => prev + child.start.duration, 0);

      requestItem.start.executionDuration =
        requestItem.start.duration - childDuration;
    }
    requestItem.children.forEach((c) => this.#calculateExecutionTime(c));
  }

  /**
   *
   * @param {ParsedLine[]} parsedLines
   */
  #groupByItem(parsedLines) {
    const uniqueItems = {};
    parsedLines
      .filter(
        (parsedLine) =>
          parsedLine.name &&
          parsedLine.executionDuration &&
          parsedLine.type !== 'FILTER_TIMING',
      )
      .forEach((parsedLine) => {
        const id = `${parsedLine.type}:${parsedLine.name.replace(/#\d+/, '')}`;
        if (!uniqueItems[id]) {
          uniqueItems[id] = {
            count: 0,
            executionDuration: 0,
            instances: [],
          };
        }
        uniqueItems[id].count += 1;
        uniqueItems[id].executionDuration += parsedLine.executionDuration;
        uniqueItems[id].instances.push(parsedLine);
      });
    return uniqueItems;
  }

  /**
   * @param {ParsedLine[]} parsedLines
   * @returns {RequestTreeItem}
   */
  #generateRequestTree(parsedLines) {
    const request = { start: parsedLines[0], children: [] };
    let parent = request;
    const parents = [];
    let lines = parsedLines;
    if (parsedLines[0].type === 'REQUEST') {
      lines = parsedLines.slice(1);
    }
    lines.forEach((parsedLine, i) => {
      const idx = i + 1;
      try {
        if (parsedLine.type === 'TIMER_END') {
          parent = parents.pop();
          const startItem = parent?.children[parent.children.length - 1];
          if (parsedLine.data.item !== startItem?.start.data.item) {
            this.#log.warn(
              `Mismatched start and end at line: ${idx + 1} item: '${
                parsedLine.data.item
              }'`,
            );
          } else {
            startItem.end = parsedLine;
            startItem.start.duration = parsedLine.time - startItem.start.time;
            startItem.value = startItem.start.duration;
          }
        } else {
          const item = {
            start: parsedLine,
            children: [],
            value: parsedLine.duration || 0,
            name: parsedLine.name,
          };
          if (!parent) {
            this.#log.warn(`Missing parent at line: ${idx + 1}`);
            parent = item;
          } else {
            parent.children.push(item);
          }
          if (parsedLine.type === 'TIMER_START') {
            parents.push(parent);
            parent = item;
          }
        }
      } catch (err) {
        const error = Error(
          `Failed to parse file error: ${err} at line: ${idx + 1}`,
        );
        err.parsedLine = parsedLine;
        err.lineNumber = idx;
        throw error;
      }
    });

    this.#calculateExecutionTime(request);
    return request;
  }

  /**
   * @param {string} line
   * @param {ParsedLine} [previous]
   * @returns {ParsedLine | undefined}
   */
  parseLine(line, previous) {
    const data = {};

    const parser = PATTERNS.find((p) => p.pattern.exec(line.trim()));
    if (!parser) {
      return undefined;
    }
    this.#log.debug('Found parser for line', { line, type: parser.type });
    const match = parser.pattern.exec(line.trim());
    Object.keys(parser.fields).forEach((key, idx) => {
      data[parser.fields[key]] = match[idx + 1];
    });
    const name = parser.idFields.map((key) => `${data[key]}`).join(' ');
    const time = parseInt(data.time, 10);
    if (previous && parser.includeDuration) {
      previous.duration = time - previous.time;
    }
    let duration;
    if (parser.type === 'BINDINGS' && data.class) {
      duration = parseInt(data.duration, 10);
    }
    return {
      data,
      duration,
      executionDuration: duration,
      line,
      name: name || parser.type,
      time: time || 0,
      type: parser.type,
    };
  }

  /**
   * Parses the provided lines into a request tree
   * @param {Array<string>} lines the lines to parse
   * @returns {{lines: ParsedLine[], requestTree: RequestTreeItem, items: Object}} the parsed request
   */
  parse(lines) {
    /**
     * @type {Array<ParsedLine>}
     */
    const parsedLines = [];
    let prev;
    lines.forEach((line, idx) => {
      const parsedLine = this.parseLine(line, prev);
      if (parsedLine) {
        if (
          idx !== 0 &&
          (!prev || typeof prev.duration !== 'undefined') &&
          !parsedLine.duration
        ) {
          prev = parsedLine;
        }
        parsedLines.push(parsedLine);
      } else {
        this.#log.warn('No parser found', { lineNumber: idx, line });
      }
    });

    return {
      totalTime: parsedLines.slice(-1)[0].time,
      lines: parsedLines,
      requestTree: this.#generateRequestTree(parsedLines),
      items: this.#groupByItem(parsedLines),
    };
  }
}
