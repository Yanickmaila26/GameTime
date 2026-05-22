import{b as f,r as y,j as e,L as o,a as b}from"./app-CAVx5UGd.js";import{c as s}from"./createLucideIcon-BBEe2JAp.js";import{T as j,S as u}from"./trophy-CpGTTKmy.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=s("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=s("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=s("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=s("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=s("UserCheck",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=s("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=s("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=s("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),h=[{name:"Dashboard",href:"/admin",icon:g},{name:"Equipos",href:"/admin/equipos",icon:M},{name:"Árbitros",href:"/admin/arbitros",icon:w},{name:"Campeonatos",href:"/admin/campeonatos",icon:j},{name:"Partidos",href:"/admin/partidos",icon:u}];function m({item:a,onClick:l}){const n=f().url,c=n===a.href||n.startsWith(a.href+"/"),t=a.icon;return e.jsxs(o,{href:a.href,onClick:l,className:`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${c?"bg-gradient-to-r from-orange-500 to-amber-600 text-black shadow-[0_4px_15px_rgba(245,124,0,0.15)]":"text-gray-400 hover:bg-[#121212] hover:text-white"}`,children:[e.jsx(t,{className:"w-4 h-4"}),e.jsx("span",{children:a.name})]})}function p({user:a}){return e.jsx("div",{className:"p-4 border-b border-[#1a1a1a] bg-orange-500/5",children:e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center",children:e.jsx(v,{className:"w-5 h-5 text-[#F57C00]"})}),e.jsxs("div",{className:"truncate",children:[e.jsx("p",{className:"text-xs font-bold text-white truncate",children:a==null?void 0:a.name}),e.jsx("p",{className:"text-[10px] text-[#F57C00] font-black uppercase tracking-wider",children:(a==null?void 0:a.role)==="admin"?"Administrador":"Directiva"})]})]})})}function z({title:a,children:l}){const{auth:n}=f().props,c=n.user,[t,i]=y.useState(!1),x=()=>b.post("/logout");return e.jsxs("div",{className:"min-h-screen bg-[#070707] text-gray-100 flex flex-col md:flex-row",children:[e.jsxs("aside",{className:"hidden md:flex flex-col w-64 bg-[#0d0d0d] border-r border-[#1a1a1a]",children:[e.jsx("div",{className:"p-6 border-b border-[#1a1a1a]",children:e.jsxs(o,{href:"/",className:"flex items-center space-x-2",children:[e.jsx("span",{className:"w-8 h-8 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-lg flex items-center justify-center font-black text-black text-sm",children:"GT"}),e.jsx("span",{className:"font-black text-lg tracking-tight text-white",children:"GameTime"})]})}),e.jsx(p,{user:c}),e.jsx("nav",{className:"flex-1 p-4 space-y-1",children:h.map(r=>e.jsx(m,{item:r},r.href))}),e.jsx("div",{className:"p-4 border-t border-[#1a1a1a]",children:e.jsxs("button",{onClick:x,className:"w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all",children:[e.jsx(d,{className:"w-4 h-4"}),e.jsx("span",{children:"Cerrar Sesión"})]})})]}),e.jsxs("header",{className:"md:hidden bg-[#0d0d0d] border-b border-[#1a1a1a] p-4 flex items-center justify-between sticky top-0 z-40",children:[e.jsxs(o,{href:"/",className:"flex items-center space-x-2",children:[e.jsx("span",{className:"w-8 h-8 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-lg flex items-center justify-center font-black text-black text-sm",children:"GT"}),e.jsx("span",{className:"font-black text-base tracking-tight text-white",children:"GameTime"})]}),e.jsx("button",{onClick:()=>i(!t),className:"p-2 text-gray-400 hover:text-white",children:t?e.jsx(C,{className:"w-6 h-6"}):e.jsx(N,{className:"w-6 h-6"})})]}),t&&e.jsxs("div",{className:"md:hidden fixed inset-0 top-[57px] bg-[#070707] z-30 flex flex-col border-t border-[#1a1a1a]",children:[e.jsx(p,{user:c}),e.jsx("nav",{className:"flex-1 p-4 space-y-1",children:h.map(r=>e.jsx(m,{item:r,onClick:()=>i(!1)},r.href))}),e.jsx("div",{className:"p-4 border-t border-[#1a1a1a]",children:e.jsxs("button",{onClick:x,className:"w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 transition-all",children:[e.jsx(d,{className:"w-4 h-4"}),e.jsx("span",{children:"Cerrar Sesión"})]})})]}),e.jsxs("main",{className:"flex-1 p-4 md:p-8 overflow-y-auto",children:[e.jsxs("div",{className:"max-w-7xl mx-auto mb-6 flex justify-between items-center",children:[e.jsxs(o,{href:"/",className:"inline-flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white transition-colors",children:[e.jsx(k,{className:"w-4 h-4"}),e.jsx("span",{children:"Vista pública"})]}),a&&e.jsx("span",{className:"text-xs font-mono text-gray-500",children:a})]}),e.jsx("div",{className:"max-w-7xl mx-auto",children:l})]})]})}export{z as A,w as U,C as X,M as a};
