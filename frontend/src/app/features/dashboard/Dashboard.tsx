import { useEffect, useState } from 'react';
import { RequestStatus } from '../../helpers/requests/status';
import { actionsItemsConfig, recentViewedColumns } from './DashboardConfig';
import { useDispatch, useSelector } from 'react-redux';
import { UserType } from '../../helpers/requests/userType';
import './Dashboard.css';
import PageContainer from '../../components/simple/PageContainer';
import Widget from '../../components/widget/Widget';
import { getUser, isUserOfType, UserRoleType } from '../../helpers/utility';
import Actions from '../../components/action/Actions';
import { useNavigate } from 'react-router-dom';
import { fetchRecentViews } from './DashboardSlice';
import { AppDispatch } from '../../Store';

interface DashboardWidgetProps {
  title?: string;
  buttonText?: string;
  columns: any[];
  loading: RequestStatus;
  data: any[];
  allowRowsSelect?: boolean;
  onButtonClick?: () => void;
}

const changeHandler = (event: any) => {};

const DashboardTableWidget: React.FC<DashboardWidgetProps> = ({
  title,
  buttonText,
  columns,
  loading,
  data,
  allowRowsSelect,
  onButtonClick,
}) => (
  <Widget
    changeHandler={changeHandler}
    title={title}
    tableColumns={columns}
    tableData={data}
    tableIsLoading={loading}
    allowRowsSelect={allowRowsSelect}
    primaryKeycolumnName="siteId"
  >
    {buttonText && onButtonClick && (
      <button
        className="dashboard-btn"
        type="button"
        onClick={onButtonClick}
        aria-label={buttonText}
      >
        <span className="btn-lbl">{buttonText}</span>
      </button>
    )}
  </Widget>
);

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const sites = useSelector((state: any) => state.dashboard);
  const loggedInUser = getUser();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);
  const [data, setData] = useState<any[]>([]);
  const [userType, setUserType] = useState<UserType>(UserType.External);

  useEffect(() => {
    if (
      isUserOfType(UserRoleType.CLIENT) ||
      isUserOfType(UserRoleType.PUBLIC)
    ) {
      setUserType(UserType.External);
    } else if (isUserOfType(UserRoleType.INTERNAL)) {
      setUserType(UserType.Internal);
    }

    loggedInUser
      ? setName(', ' + loggedInUser?.profile.given_name + ' ')
      : setName('');
  }, [loggedInUser]);

  useEffect(() => {
    if (loggedInUser?.profile.preferred_username) {
      dispatch(fetchRecentViews(loggedInUser.profile.preferred_username));
    }
  }, [dispatch]);

  useEffect(() => {
    if (sites.status === RequestStatus.success) {
      setData(sites.dashboard.recentView.data);
      setLoading(sites.status);
    } else {
      setLoading(RequestStatus.idle);
    }
  }, [sites.status]);

  const handleActionItemClick = (item: any) => {
    switch (item.toLowerCase()) {
      case 'create-site':
        navigate('site/create');
        break;
      case 'search-site':
        navigate('/search');
        break;
      case 'view-sites-on-map':
        navigate('/map');
        break;
      default:
        break;
    }
  };

  return (
    <PageContainer role="Dashboard">
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="dashboard-title">Welcome{name}</h1>
        {userType === UserType.Internal && (
          <Actions
            label="Actions"
            items={actionsItemsConfig}
            onItemClick={handleActionItemClick}
          />
        )}
      </div>
      <DashboardTableWidget
        title="Recently Viewed"
        columns={recentViewedColumns}
        loading={loading}
        data={data ?? []}
        allowRowsSelect={false}
      />
    </PageContainer>
  );
};

export default Dashboard;
