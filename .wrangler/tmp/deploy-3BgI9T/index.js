var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
var unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime3,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
var {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert: assert2,
  disconnect,
  mainModule
} = unenvProcess;
var {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/index.js
var index_default = {
  async email(message, env2, ctx) {
    const { from, to, headers } = message;
    const subject = headers.get("subject") || "(No Subject)";
    const rawContent = await new Response(message.raw).text();
    let aiResult = await extractWithAI(from, subject, rawContent, env2);
    if (!aiResult) {
      const serviceInfo = detectService(from, subject, rawContent);
      const otpCode = extractOTP(subject, rawContent);
      aiResult = {
        service: serviceInfo.name,
        color: serviceInfo.color,
        otp: otpCode,
        isOTP: !!otpCode
      };
    }
    const emailData = {
      from,
      to,
      subject,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      raw: rawContent,
      ...aiResult,
      isAIResult: !!aiResult?.aiGenerated,
      aiError: aiResult?.error || null
    };
    const proxyBase = (env2.RAILWAY_URL || "").replace(/\/$/, "");
    if (proxyBase) {
      try {
        await fetch(`${proxyBase}/api/emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env2.PROXY_KEY || ""}`
          },
          body: JSON.stringify(emailData)
        });
      } catch (e) {
        console.error("Proxy Insert Error:", e);
      }
    }
  },
  async fetch(request, env2, ctx) {
    const url = new URL(request.url);
    const filterOTP = url.searchParams.get("filter") === "otp";
    let emails = [];
    let dbError = null;
    let debugInfo = "";
    const proxyBase = (env2.RAILWAY_URL || "").replace(/\/$/, "");
    if (!proxyBase) dbError = "RAILWAY_URL secret is not set.";
    try {
      if (proxyBase) {
        const resp = await fetch(`${proxyBase}/api/emails?filter=${filterOTP ? "otp" : ""}`, {
          headers: { "Authorization": `Bearer ${env2.PROXY_KEY || ""}` }
        });
        debugInfo = `Status: ${resp.status}`;
        if (!resp.ok) throw new Error(`Proxy Error: ${resp.status} ${await resp.text()}`);
        const dbData = await resp.json();
        debugInfo += ` | Found: ${dbData.length}`;
        emails = dbData.map((e) => ({
          from: e.sender,
          subject: e.subject,
          timestamp: e.created_at,
          service: e.service_name,
          color: e.brand_color,
          otp: e.otp_code,
          link: e.action_link,
          actionLabel: e.action_label,
          isOTP: e.is_otp,
          isAIResult: e.is_ai_result,
          aiModel: e.ai_model,
          aiError: e.ai_error,
          raw: e.body_raw
        }));
      }
    } catch (e) {
      console.error("Proxy Fetch Error:", e);
      dbError = e.message;
    }
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Email Hub</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #050505;
            --card-bg: rgba(255, 255, 255, 0.02);
            --border: rgba(255, 255, 255, 0.08);
            --text: #a0a0a0;
            --text-bright: #ffffff;
            --accent: #6366f1;
            --spotify: #1DB954;
            --discord: #5865F2;
            --steam: #171a21;
        }
        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            width: 100%;
            max-width: 700px;
        }
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 40px;
            padding: 20px 0;
            border-bottom: 1px solid var(--border);
        }
        .nav h1 {
            font-size: 1.5rem;
            margin: 0;
            background: linear-gradient(135deg, #fff 0%, #666 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .filters {
            display: flex;
            gap: 10px;
        }
        .filter-btn {
            background: var(--card-bg);
            border: 1px solid var(--border);
            color: var(--text);
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s;
            text-decoration: none;
            font-size: 0.9rem;
        }
        .filter-btn.active {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
        }
        .email-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 16px;
            backdrop-filter: blur(20px);
            position: relative;
            overflow: hidden;
            transition: transform 0.2s, border-color 0.2s;
        }
        .email-card:hover { border-color: rgba(255,255,255,0.2); }
        .service-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .time { font-size: 0.8rem; opacity: 0.5; float: right; }
        .subject {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-bright);
            margin-bottom: 4px;
        }
        .from { font-size: 0.9rem; opacity: 0.7; margin-bottom: 16px; }
        
        .otp-container {
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px dashed var(--border);
        }
        .otp-label { font-size: 0.8rem; text-transform: uppercase; opacity: 0.5; margin-bottom: 8px; }
        .otp-code {
            font-family: monospace;
            font-size: 2.5rem;
            font-weight: 600;
            letter-spacing: 0.2em;
            color: var(--accent);
            cursor: pointer;
        }
        .otp-code:active { transform: scale(0.95); }
        
        .raw-content {
            font-size: 0.85rem;
            line-height: 1.5;
            white-space: pre-wrap;
            opacity: 0.6;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
            max-height: 100px;
            overflow: hidden;
            mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        }
        .no-emails { text-align: center; padding: 100px; opacity: 0.3; }
        .ai-tag {
            position: absolute;
            bottom: 10px;
            right: 15px;
            font-size: 0.6rem;
            text-transform: uppercase;
            opacity: 0.2;
            letter-spacing: 0.1em;
        }
        .action-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 10px;
        }
        .verify-btn {
            display: block;
            background: var(--accent);
            color: white;
            text-decoration: none;
            padding: 16px;
            border-radius: 12px;
            font-weight: 600;
            text-align: center;
            transition: transform 0.2s, background 0.2s;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        .verify-btn:hover { transform: translateY(-2px); background: #4f46e5; }
        .verify-btn:active { transform: scale(0.98); }
    </style>
</head>
<body>
    <div class="container">
        <div class="nav">
            <h1>AI Email Hub</h1>
            <div class="filters">
                <a href="/" class="filter-btn ${!filterOTP ? "active" : ""}">All</a>
                <a href="/?filter=otp" class="filter-btn ${filterOTP ? "active" : ""}">Codes Only</a>
            </div>
            <div style="font-size: 0.7rem; opacity: 0.3; margin-top: 5px;">${debugInfo}</div>
        </div>

        ${dbError ? `
            <div style="background: rgba(255,0,0,0.1); border: 1px solid #ff4444; color: #ff4444; padding: 15px; border-radius: 12px; margin-bottom: 20px; font-size: 0.9rem;">
                <strong>Database Error:</strong> ${dbError}<br>
                <small>Hint: If you see "No such host", you might be using a Railway <strong>Internal</strong> URL. Use the <strong>External</strong> one!</small>
            </div>
        ` : ""}

        ${emails.length === 0 ? '<div class="no-emails">No emails found.</div>' : emails.map((e) => `
            <div class="email-card">
                <span class="time">${formatDate(e.timestamp)}</span>
                <div class="service-badge" style="background: ${e.color || "#333"}; color: white;">
                    ${e.service || "Unknown"}
                </div>
                
                ${e.otp || e.link ? `
                    <div class="action-container">
                        ${e.otp ? `
                            <div class="otp-container">
                                <div class="otp-label">Verification Code</div>
                                <div class="otp-code" onclick="navigator.clipboard.writeText('${e.otp}'); alert('Copied!')">${e.otp}</div>
                            </div>
                        ` : ""}
                        ${e.link ? `
                            <a href="${e.link}" target="_blank" class="verify-btn">
                                ${e.actionLabel || "Complete Verification"}
                            </a>
                        ` : ""}
                    </div>
                ` : `
                    <div class="subject">${e.subject}</div>
                    <div class="from">${cleanName(e.from)}</div>
                    <div class="raw-content">${cleanBody(e.raw)}</div>
                `}
                <div class="ai-tag" style="opacity: ${e.isAIResult ? 0.6 : 0.4}; color: ${e.isAIResult ? "var(--accent)" : "#ff4444"}">
                    ${e.isAIResult ? `AI Extracted (${e.aiModel || "Gemini"})` : `Legacy Regex ${e.aiError ? ` \u2022 ${e.aiError}` : ""}`}
                </div>
            </div>
        `).join("")}
    </div>
</body>
</html>
    `;
    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" }
    });
  }
};
async function extractWithAI(from, subject, body, env2) {
  if (!env2.GEMINI_API_KEY) return { error: "Missing Key" };
  let decoded = body.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  const boundaryMatch = body.match(/boundary="?([^"]+)"?/i);
  let targetContent = decoded;
  if (boundaryMatch) {
    const parts = decoded.split(`--${boundaryMatch[1]}`);
    const plainPart = parts.find((p) => p.toLowerCase().includes("text/plain"));
    if (plainPart) targetContent = plainPart.split("\r\n\r\n").slice(1).join("\r\n\r\n");
  }
  let cleanedBody = targetContent.replace(/[^\x20-\x7E\n\r]/g, "").replace(/^[a-zA-Z0-9-]+:[\s\S]*?\r?\n/gm, "").replace(/bounce-ae1[^\s]+/gi, "").slice(0, 3e3);
  const prompt = `
      TASK: Analyze the email and extract the PRIMARY ACTION (Code OR Link).
      
      RULES:
      1. If the email contains a Verification/Login CODE, extract it.
      2. If the email tells you to "Click here", "Verify", or "Link" (common in Discord/GitHub), extract that URL.
      3. For Discord: Find the long verification link.
      4. IGNORE bounce addresses, tracking pixels, or footer links.
      5. Provide a short "actionLabel" like "Verify Login", "Approve Access", or "Copy Code".
      
      EMAIL BODY:
      ---
      ${cleanedBody}
      ---

      Return ONLY JSON:
      {
        "service": "Brand",
        "otp": "code_or_null",
        "link": "https://url_or_null",
        "actionLabel": "Button Label",
        "color": "#hex",
        "isOTP": true
      }
    `;
  const candidates = [
    "gemini-flash-latest",
    "gemini-1.5-flash",
    "gemini-pro-latest",
    "gemini-2.0-flash"
  ];
  let lastError = "";
  for (const model of candidates) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env2.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      });
      const data = await response.json();
      if (data.error) {
        lastError = data.error.message;
        const errStr = lastError.toLowerCase();
        if (errStr.includes("not found") || errStr.includes("quota") || errStr.includes("limit")) continue;
        return { error: lastError };
      }
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        let text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
        const parsed = JSON.parse(text);
        const potential = (parsed.otp || "").toString();
        if (potential.includes("@") || potential.includes(".") || potential.length > 10) {
          parsed.otp = null;
        }
        if (parsed.link && !parsed.link.startsWith("http")) {
          parsed.link = null;
        }
        parsed.isOTP = !!(parsed.otp || parsed.link);
        return { ...parsed, aiGenerated: true, aiModel: model };
      }
    } catch (err) {
      lastError = err.message;
      continue;
    }
  }
  return { error: lastError || "All models failed" };
}
__name(extractWithAI, "extractWithAI");
function detectService(from, subject, body) {
  const fromLower = from.toLowerCase();
  const content = (subject + body).toLowerCase();
  const allContent = fromLower + content;
  const services = [
    // --- Gaming ---
    { name: "Epic Games", keywords: ["epicgames", "epic games"], color: "#313131" },
    { name: "Steam", keywords: ["steam"], color: "#171a21" },
    { name: "Riot Games", keywords: ["riotgames", "riot games", "league of legends", "valorant"], color: "#d13639" },
    { name: "Ubisoft", keywords: ["ubisoft"], color: "#0070ff" },
    { name: "EA", keywords: ["ea.com", "electronic arts", "origin"], color: "#f53333" },
    { name: "Blizzard", keywords: ["blizzard", "battle.net"], color: "#00aeff" },
    { name: "PlayStation", keywords: ["playstation", "sony"], color: "#003087" },
    { name: "Xbox", keywords: ["xbox", "microsoft"], color: "#107c10" },
    { name: "Nintendo", keywords: ["nintendo"], color: "#e60012" },
    { name: "Rockstar", keywords: ["rockstargames", "rockstar games"], color: "#ffab00" },
    { name: "Twitch", keywords: ["twitch"], color: "#9146ff" },
    // --- AI Platforms ---
    { name: "OpenAI", keywords: ["openai", "chatgpt"], color: "#74aa9c" },
    { name: "Anthropic", keywords: ["anthropic", "claude"], color: "#cc9b7a" },
    { name: "Perplexity", keywords: ["perplexity"], color: "#20b2aa" },
    { name: "Midjourney", keywords: ["midjourney"], color: "#6366f1" },
    { name: "Mistral", keywords: ["mistral"], color: "#f5d142" },
    // --- Streaming ---
    { name: "Spotify", keywords: ["spotify"], color: "#1DB954" },
    { name: "Netflix", keywords: ["netflix"], color: "#E50914" },
    { name: "Disney+", keywords: ["disneyplus", "disney+"], color: "#113CCF" },
    { name: "Prime Video", keywords: ["prime video", "amazon video"], color: "#00A8E1" },
    { name: "Apple TV", keywords: ["apple tv"], color: "#000000" },
    { name: "SoundCloud", keywords: ["soundcloud"], color: "#ff5500" },
    // --- Tech & Social ---
    { name: "Discord", keywords: ["discord"], color: "#5865F2" },
    { name: "Google", keywords: ["google", "gmail", "youtube"], color: "#4285F4" },
    { name: "GitHub", keywords: ["github"], color: "#24292e" },
    { name: "Microsoft", keywords: ["microsoft", "outlook", "azure"], color: "#00a4ef" },
    { name: "Apple", keywords: ["apple", "icloud"], color: "#555555" },
    { name: "Twitter / X", keywords: ["twitter", " x "], color: "#1DA1F2" },
    { name: "Instagram", keywords: ["instagram"], color: "#E1306C" },
    { name: "Facebook", keywords: ["facebook", "meta"], color: "#1877F2" },
    { name: "LinkedIn", keywords: ["linkedin"], color: "#0077B5" }
  ];
  for (const s of services) {
    if (s.keywords.some((k) => fromLower.includes(k.replace(" ", "")))) return s;
  }
  for (const s of services) {
    if (s.keywords.some((k) => allContent.includes(k))) return s;
  }
  return { name: "Email", color: "#333" };
}
__name(detectService, "detectService");
function extractOTP(subject, body) {
  const ignorePatterns = [/\b202\d\b/, /\b8787\b/, /\b8080\b/, /\b595959\b/, /\b000000\b/, /\bPUBLIC\b/];
  const blacklist = ["FROM", "GMAIL", "EMAIL", "CODE", "SEND", "LOGIN", "USER", "INFO", "MAIL", "PUBLIC"];
  const patterns = [
    // 1. Explicitly labeled codes (High confidence)
    /verification code:?\s*([A-Z0-9]{4,8})/i,
    /security code:?\s*([A-Z0-9]{4,8})/i,
    /code:?\s*([A-Z0-9]{4,8})/i,
    /kod:?\s*(\d{4,8})/i,
    /is:\s*([A-Z0-9]{4,8})\b/i,
    // "Your code is: 12345"
    // 2. Likely 6-digit numeric codes (Very common)
    /\b\d{6}\b/,
    // 3. Fallback alphanumeric/numeric codes
    /\b\d{4,8}\b/,
    /\b[A-Z0-9]{5,6}\b/
  ];
  const findMatch = /* @__PURE__ */ __name((text) => {
    for (const p of patterns.slice(0, 5)) {
      const match = text.match(p);
      if (match && match[1]) {
        const potentialCode = match[1].trim();
        if (isValidCode(potentialCode)) return potentialCode;
      }
    }
    for (const p of patterns.slice(5)) {
      const match = text.match(p);
      if (match) {
        const potentialCode = (match[1] || match[0]).trim();
        if (isValidCode(potentialCode)) return potentialCode;
      }
    }
    return null;
  }, "findMatch");
  function isValidCode(code) {
    if (!code) return false;
    const upCode = code.toUpperCase();
    if (blacklist.includes(upCode)) return false;
    if (ignorePatterns.some((ip) => ip.test(code))) return false;
    const hasNumber = /\d/.test(code);
    if (!hasNumber && code.length <= 4) return false;
    return true;
  }
  __name(isValidCode, "isValidCode");
  return findMatch(subject) || findMatch(body);
}
__name(extractOTP, "extractOTP");
function cleanBody(raw) {
  let cleaned = raw.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/boundary="?([^"]+)"?/i, "").replace(/^[a-zA-Z0-9-]+:[\s\S]*?\r?\n/gm, "");
  return cleaned.slice(0, 500).trim();
}
__name(cleanBody, "cleanBody");
function cleanName(from) {
  if (!from) return "Unknown";
  const nameMatch = from.match(/^"?(.*?)"?\s*<.*>$/);
  if (nameMatch && nameMatch[1]) return nameMatch[1];
  if (from.includes("epicgames.com")) return "Epic Games";
  if (from.includes("@")) return from.split("@")[0];
  return from;
}
__name(cleanName, "cleanName");
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
__name(formatDate, "formatDate");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
