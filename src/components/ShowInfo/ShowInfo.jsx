import styles from "./ShowInfo.module.css";

const ShowInfo = (props) => {
  const infoColor = props.isError ? "#ff0000" : "#008000";

  return (
    <>
      <div className={styles.infoStyle} style={{ color: infoColor }}>
        {props.msg}
      </div>
    </>
  );
};

export default ShowInfo;
