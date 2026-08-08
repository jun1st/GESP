'use client';

import BinaryByteBuilder from './experiments/BinaryByteBuilder';
import BinaryConverter from './experiments/BinaryConverter';
import StorageUnits from './experiments/StorageUnits';
import ComputerParts from './experiments/ComputerParts';
import VariableBox from './experiments/VariableBox';
import ArithmeticCalc from './experiments/ArithmeticCalc';
import LogicLights from './experiments/LogicLights';
import GradeBranch from './experiments/GradeBranch';
import StarLoop from './experiments/StarLoop';
import CodeRunner from './experiments/CodeRunner';
import StoragePower from './experiments/StoragePower';
import NetworkRings from './experiments/NetworkRings';
import FlowChart from './experiments/FlowChart';
import AsciiEncoder from './experiments/AsciiEncoder';
import IntDivision from './experiments/IntDivision';
import SwitchBreak from './experiments/SwitchBreak';
import LoopPattern from './experiments/LoopPattern';
import MathButtons from './experiments/MathButtons';
import Dice from './experiments/Dice';

export default function Experiments({ level }) {
  if (level === 0) {
    return (
      <>
        <BinaryByteBuilder />
        <BinaryConverter />
        <StorageUnits />
      </>
    );
  }
  if (level === 1) {
    return (
      <>
        <ComputerParts />
        <VariableBox />
        <ArithmeticCalc />
        <LogicLights />
        <GradeBranch />
        <StarLoop />
        <CodeRunner />
      </>
    );
  }
  if (level === 2) {
    return (
      <>
        <StoragePower />
        <NetworkRings />
        <FlowChart />
        <AsciiEncoder />
        <IntDivision />
        <SwitchBreak />
        <LoopPattern />
        <MathButtons />
        <Dice />
        <CodeRunner />
      </>
    );
  }
  return (
    <div className="exp-card">
      <h3>🧪 互动实验</h3>
      <div className="exp-out">该级别的互动实验迁移中，先体验上面的课程内容～</div>
    </div>
  );
}
