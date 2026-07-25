import React from "react";
import riderOrange from "../assets/rider-orange.png";
import riderHelper from "../assets/rider-helper.png";

/**
 * Animated login illustration:
 * Rider's bike breaks down -> calls for help -> helper arrives.
 * Pure CSS animation, loops every 9s. No external libraries needed.
 *
 * Usage: import LoginIllustration from "./LoginIllustration";
 *        <LoginIllustration />
 */
export default function LoginIllustration() {
  return (
    <div className="login-illustration">
      <div className="li-dot li-d1" />
      <div className="li-dot li-d2" />
      <div className="li-dot li-d3" />
      <div className="li-ground" />

      {/* Rider whose bike breaks down */}
      <div className="li-rider" id="li-rider1">
        <div className="li-bump">
          <img src={riderOrange} alt="rider" />
        </div>

        <svg className="li-bubble" id="li-shock" width="34" height="34" viewBox="0 0 34 34">
          <circle cx="17" cy="17" r="17" fill="#fff" stroke="#F4763A" strokeWidth="2" />
          <text x="17" y="24" textAnchor="middle" fontSize="20" fontWeight="800" fill="#F4763A">!</text>
        </svg>

        <div className="li-speech" id="li-phoneCall">
          <span className="li-icon-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 10c1-2 3-2 4 0l2 3c1 1 0 2-1 3-1 1 0 3 2 5 2 2 4 3 5 2 1-1 2-2 3-1l3 2c2 1 2 3 0 4-3 3-8 1-12-3-4-4-6-9-3-12l0-3z"
                fill="#fff"
                transform="translate(-8,-2) scale(0.9)"
              />
            </svg>
          </span>
          <span>HELP CHAHIYE ATAK GAYE</span>
        </div>
      </div>

      {/* Helper arriving */}
      <div className="li-rider" id="li-rider2">
        <img src={riderHelper} alt="helper" />
        <div className="li-speech" id="li-arriveCheck">
          <span className="li-icon-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12 L10 18 L20 6"
                stroke="#fff"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>aa gya madad karne</span>
        </div>
      </div>

      <style>{`
        .login-illustration{
          position:relative;
          width:100%;
          height:270px;
          overflow:hidden;
        }
        .li-ground{
          position:absolute; bottom:40px; left:0; right:0; height:2px;
          background:repeating-linear-gradient(90deg, #e3c3a3 0 14px, transparent 14px 26px);
        }
        .li-dot{ position:absolute; border-radius:50%; background:#FBD9BE; opacity:.7; }
        .li-d1{ width:26px; height:26px; top:8px; left:36px; }
        .li-d2{ width:14px; height:14px; top:34px; right:60px; }
        .li-d3{ width:8px; height:8px; top:64px; right:30px; background:#F4763A; }

        .li-rider{ position:absolute; bottom:38px; width:150px; }
        .li-rider img{ width:100%; display:block; filter:drop-shadow(0 8px 10px rgba(0,0,0,.18)); }

        #li-rider1{ left:0; animation: li-r1move 9s infinite; }
        #li-rider2{ left:0; animation: li-r2move 9s cubic-bezier(.22,.9,.32,1) infinite; }

        .li-bump{ animation: li-bump 9s infinite; }

        .li-bubble{ position:absolute; opacity:0; transform:scale(.4); transform-origin:bottom left; }
        #li-shock{ top:-8px; left:76px; animation: li-shockPop 9s infinite; }

        .li-speech{
          position:absolute; opacity:0; transform:scale(.4); transform-origin:bottom left;
          display:flex; align-items:center; gap:6px; max-width:172px;
          background:#fff; border:2px solid #F4763A; border-radius:16px;
          padding:6px 10px 6px 8px; box-shadow:0 6px 14px rgba(0,0,0,.12);
        }
        .li-speech::after{
          content:""; position:absolute; bottom:-8px; left:20px;
          border-width:8px 6px 0 6px; border-style:solid;
          border-color:#F4763A transparent transparent transparent;
        }
        .li-icon-badge{
          width:22px; height:22px; border-radius:50%; background:#F4763A;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .li-speech span{
          font-family:'Baloo 2','Segoe UI',sans-serif; font-weight:700; font-size:11.5px;
          line-height:1.2; color:#D9601F; letter-spacing:.1px;
        }
        #li-phoneCall{ top:-24px; left:80px; animation: li-phonePop 9s infinite; }
        #li-arriveCheck{ top:-26px; left:-6px; max-width:148px; animation: li-checkPop 9s infinite; }

        @keyframes li-r1move{
          0%   { left:-170px; }
          16%  { left:6px; }
          58%  { left:6px; }
          100% { left:6px; }
        }
        @keyframes li-bump{
          0%, 15%  { transform:translateY(0) rotate(0deg); }
          16%      { transform:translateY(-4px) rotate(-2deg); }
          17.5%    { transform:translateY(0) rotate(2deg); }
          19%      { transform:translateY(-2px) rotate(-1deg); }
          20%, 100%{ transform:translateY(0) rotate(0deg); }
        }
        @keyframes li-shockPop{
          0%, 17%  { opacity:0; transform:scale(.3); }
          20%      { opacity:1; transform:scale(1.15); }
          24%      { opacity:1; transform:scale(1); }
          34%      { opacity:0; transform:scale(.6); }
          100%     { opacity:0; }
        }
        @keyframes li-phonePop{
          0%, 27%  { opacity:0; transform:scale(.3) rotate(-8deg); }
          31%      { opacity:1; transform:scale(1.1) rotate(0deg); }
          58%      { opacity:1; transform:scale(1) rotate(0deg); }
          62%      { opacity:0; transform:scale(.6); }
          100%     { opacity:0; }
        }
        @keyframes li-r2move{
          0%, 45%  { left:400px; }
          58%      { left:132px; }
          100%     { left:132px; }
        }
        @keyframes li-checkPop{
          0%, 60%  { opacity:0; transform:scale(.3); }
          64%      { opacity:1; transform:scale(1.15); }
          68%      { opacity:1; transform:scale(1); }
          97%      { opacity:1; transform:scale(1); }
          100%     { opacity:0; transform:scale(.7); }
        }
      `}</style>
    </div>
  );
}