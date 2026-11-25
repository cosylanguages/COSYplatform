'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'classroom.html'), 'utf8');

function extractFunction(source, name) {
  const start = source.indexOf('function ' + name + '(');
  assert.notEqual(start, -1, name + ' exists in classroom.html');
  let depth = 0;
  let started = false;
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') {
      depth++;
      started = true;
    } else if (source[i] === '}') {
      depth--;
      if (started && depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error('Unterminated function ' + name);
}

function runSwitchRole(actualRole, requestedRole) {
  const toasts = [];
  const button = () => ({ className: '' });
  const context = {
    userProfile: { role: actualRole },
    currentRole: actualRole === 'founder' ? 'teacher' : actualRole,
    currentLessonPath: 'default',
    dynamicSlides: [],
    document: { getElementById: () => button() },
    loadDynamicLesson() {},
    renderDynamicSlideContainers() {},
    sendData() {},
    applyCapabilities() {},
    CosyUI: { toast: (message, type) => toasts.push({ message, type }) }
  };
  context.window = { CosyUI: context.CosyUI };
  vm.createContext(context);
  vm.runInContext(extractFunction(html, 'switchRole'), context);
  context.switchRole(requestedRole);
  return { context, toasts };
}

function runEnforceRolePermissions(role) {
  const hidden = {
    'role-teacher-btn': new Set(),
    'role-student-btn': new Set()
  };
  const portal = { href: '' };
  const switched = [];

  const element = (id) => ({
    classList: {
      add(className) { hidden[id].add(className); },
      remove(className) { hidden[id].delete(className); }
    }
  });

  const context = {
    userProfile: { role },
    document: {
      getElementById(id) {
        if (id === 'portal-link') return portal;
        return element(id);
      },
      body: { classList: { remove() {} } }
    },
    switchRole(view) { switched.push(view); },
    applyCapabilities() {}
  };
  vm.createContext(context);
  vm.runInContext(extractFunction(html, 'enforceRolePermissions'), context);
  context.enforceRolePermissions();

  return { hidden, portal, switched };
}

test('students cannot switch to the teacher view', () => {
  const { context, toasts } = runSwitchRole('student', 'teacher');
  assert.equal(context.currentRole, 'student');
  assert.equal(toasts.length, 1);
  assert.equal(toasts[0].type, 'error');
});

test('teachers cannot switch to the student view', () => {
  const { context, toasts } = runSwitchRole('teacher', 'student');
  assert.equal(context.currentRole, 'teacher');
  assert.equal(toasts.length, 1);
  assert.equal(toasts[0].type, 'error');
});

test('teachers keep their own view', () => {
  const { context, toasts } = runSwitchRole('teacher', 'teacher');
  assert.equal(context.currentRole, 'teacher');
  assert.equal(toasts.length, 0);
});

test('founders can switch between both views', () => {
  const toStudent = runSwitchRole('founder', 'student');
  assert.equal(toStudent.context.currentRole, 'student');
  assert.equal(toStudent.toasts.length, 0);

  const toTeacher = runSwitchRole('founder', 'teacher');
  assert.equal(toTeacher.context.currentRole, 'teacher');
  assert.equal(toTeacher.toasts.length, 0);
});

test('only founders see the role switch controls', () => {
  const student = runEnforceRolePermissions('student');
  assert.equal(student.hidden['role-teacher-btn'].has('hidden'), true);
  assert.equal(student.hidden['role-student-btn'].has('hidden'), true);
  assert.equal(student.portal.href, 'student.html');
  assert.deepEqual(student.switched, ['student']);

  const teacher = runEnforceRolePermissions('teacher');
  assert.equal(teacher.hidden['role-teacher-btn'].has('hidden'), true);
  assert.equal(teacher.hidden['role-student-btn'].has('hidden'), true);
  assert.equal(teacher.portal.href, 'teacher.html');
  assert.deepEqual(teacher.switched, ['teacher']);

  const founder = runEnforceRolePermissions('founder');
  assert.equal(founder.hidden['role-teacher-btn'].has('hidden'), false);
  assert.equal(founder.hidden['role-student-btn'].has('hidden'), false);
  assert.equal(founder.portal.href, 'founder.html');
  assert.deepEqual(founder.switched, ['teacher']);
});
